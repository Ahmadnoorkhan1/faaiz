import { useState, useCallback } from 'react';
import { Question, ScopingForm } from '../types';
import * as questionUtils from '../utils/questionUtils';
import api from '../../../../service/apiService';
import { useAuth } from '../../../../utils/AuthContext';
import { toast } from 'react-hot-toast';

export function useScopingForm(initialForm?: any) {
  const [questions, setQuestions] = useState<Question[]>(initialForm?.questions || []);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAddQuestion = useCallback((type: 'text' | 'radio' | 'checkbox') => {
    setQuestions(prev => questionUtils.addQuestion(type, prev));
  }, []);

  const handleUpdateQuestionText = useCallback((questionId: string, text: string) => {
    setQuestions(prev => questionUtils.updateQuestionText(questionId, text, prev));
  }, []);

  const handleUpdateQuestionRequired = useCallback((questionId: string, required: boolean) => {
    setQuestions(prev => questionUtils.updateQuestionRequired(questionId, required, prev));
  }, []);

  const handleAddOption = useCallback((questionId: string) => {
    setQuestions(prev => questionUtils.addOption(questionId, prev));
  }, []);

  const handleUpdateOption = useCallback((questionId: string, index: number, value: string) => {
    setQuestions(prev => questionUtils.updateOption(questionId, index, value, prev));
  }, []);

  const handleRemoveOption = useCallback((questionId: string, optionIndex: number) => {
    setQuestions(prev => questionUtils.removeOption(questionId, optionIndex, prev));
  }, []);

  const handleRemoveQuestion = useCallback((questionId: string) => {
    setQuestions(prev => questionUtils.removeQuestion(questionId, prev));
    toast.success('Question removed');
  }, []);

  const handleMoveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
    setQuestions(prev => questionUtils.moveQuestion(index, direction, prev));
  }, []);

 const saveForm = useCallback(async (service: string) => {
  if (questions.length === 0) {
    toast.error('Please add at least one question to the form');
    return false;
  }

  setLoading(true);
  try {
    const endpoint = initialForm.scopingForm ? '/api/scoping-forms/update' : '/api/scoping-forms/create';
    
    const payload = {
      ...(initialForm?.id ? { id: initialForm.id } : {}),
      service, // this will be a string like "SEO", "BRANDING"
      questions,
      createdById: user?.id
    };

    console.log("Sending payload:", payload);

    const response = await api.post(endpoint, payload);

    if (response.data.success) {
      toast.success(`Scoping form ${initialForm ? 'updated' : 'created'} successfully`);
      return true;
    } else {
      throw new Error(response.data.message || 'Unknown error');
    }
  } catch (error: any) {
    console.error("Error saving form:", error);
    toast.error(`Failed to save form: ${error.message}`);
    return false;
  } finally {
    setLoading(false);
  }
}, [questions, initialForm, user?.id]);


  return {
    questions,
    setQuestions,
    loading,
    handleAddQuestion,
    handleUpdateQuestionText,
    handleUpdateQuestionRequired,
    handleAddOption,
    handleUpdateOption,
    handleRemoveOption,
    handleRemoveQuestion,
    handleMoveQuestion,
    saveForm
  };
}