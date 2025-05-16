import { v4 as uuidv4 } from 'uuid';
import { Question } from '../types';

/**
 * Adds a new question of the specified type
 */
export const addQuestion = (
  type: 'text' | 'radio' | 'checkbox',
  questions: Question[]
): Question[] => {
  const newQuestion: Question = {
    id: uuidv4(),
    text: '',
    type,
    required: false,
    options: type === 'text' ? undefined : ['']
  };
  
  return [...questions, newQuestion];
};

/**
 * Updates a question's text
 */
export const updateQuestionText = (
  questionId: string,
  text: string,
  questions: Question[]
): Question[] => {
  return questions.map(q => 
    q.id === questionId ? { ...q, text } : q
  );
};

/**
 * Updates a question's required status
 */
export const updateQuestionRequired = (
  questionId: string,
  required: boolean,
  questions: Question[]
): Question[] => {
  return questions.map(q => 
    q.id === questionId ? { ...q, required } : q
  );
};

/**
 * Updates a specific option in a question
 */
export const updateOption = (
  questionId: string,
  index: number,
  value: string,
  questions: Question[]
): Question[] => {
  return questions.map(q =>
    q.id === questionId
      ? {
          ...q,
          options: q.options?.map((opt, i) => (i === index ? value : opt))
        }
      : q
  );
};

/**
 * Adds a new option to a question
 */
export const addOption = (
  questionId: string,
  questions: Question[]
): Question[] => {
  return questions.map(q =>
    q.id === questionId && q.options
      ? { ...q, options: [...q.options, ''] }
      : q
  );
};

/**
 * Removes an option from a question
 */
export const removeOption = (
  questionId: string,
  optionIndex: number,
  questions: Question[]
): Question[] => {
  return questions.map(q =>
    q.id === questionId && q.options
      ? { 
          ...q, 
          options: q.options.filter((_, i) => i !== optionIndex)
        }
      : q
  );
};

/**
 * Removes a question from the list
 */
export const removeQuestion = (
  questionId: string,
  questions: Question[]
): Question[] => {
  return questions.filter(q => q.id !== questionId);
};

/**
 * Moves a question up or down in the list
 */
export const moveQuestion = (
  index: number,
  direction: 'up' | 'down',
  questions: Question[]
): Question[] => {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  
  if (newIndex < 0 || newIndex >= questions.length) {
    return questions;
  }
  
  const updatedQuestions = [...questions];
  const temp = updatedQuestions[index];
  updatedQuestions[index] = updatedQuestions[newIndex];
  updatedQuestions[newIndex] = temp;
  
  return updatedQuestions;
};