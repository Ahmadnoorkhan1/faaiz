import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Question, ScopingForm } from '../../types';
import { useScopingForm } from '../../hooks/useScopingForm';
import QuestionEditor from './QuestionEditor';
import QuestionItem from './QuestionItem';

interface FormBuilderProps {
  selectedService: string;
  selectedForm?: ScopingForm;
  onBack: () => void;
  onPreview?: () => void;
  isEdit?: boolean;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ 
  selectedService, 
  selectedForm, 
  onBack, 
  onPreview,
  isEdit = false
}) => {
  const {
    questions,
    setQuestions,
    loading,
    handleAddQuestion,
    handleRemoveQuestion,
    handleMoveQuestion,
    saveForm
  } = useScopingForm(selectedForm);

  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const handleSaveQuestion = (updatedQuestion: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
    setEditingQuestion(null);
  };

  const handleSaveForm = async () => {
    const success = await saveForm(selectedService);
    if (success) {
      setTimeout(() => {
        onBack();
      }, 1500);
    }
  };

  return (
    <div className="bg-[#131823] p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-medium text-white">
          {isEdit ? 'Edit' : 'Create'} Scoping Form
        </h2>
        <div className="flex items-center gap-4">
          <p className="text-gray-200 bg-blue-900/30 px-3 py-1 rounded-full text-sm">
            {selectedService.replace(/_/g, ' ')}
          </p>
          <button 
            className="bg-red-500 hover:bg-red-600 transition-colors text-white h-8 w-8 flex justify-center items-center rounded-full" 
            onClick={onBack}
            type="button"
          >
            <FaArrowLeft />
          </button>
        </div>
      </div>
      
      {isEdit && (
        <div className="flex justify-end items-center mb-6">
          <button 
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 flex justify-center items-center rounded-md" 
            onClick={onPreview}
            type="button"
          >
            Preview Form
          </button>
        </div>
      )}
      
      <div className="mb-6 p-4 bg-[#1a1f2b] rounded-lg border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Add New Questions</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleAddQuestion('text')} 
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md transition-all"
            type="button"
          >
            <span className="mr-2">+</span> Text Question
          </button>
          <button 
            onClick={() => handleAddQuestion('radio')} 
            className="flex items-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-md transition-all"
            type="button"
          >
            <span className="mr-2">+</span> Radio Question
          </button>
          <button 
            onClick={() => handleAddQuestion('checkbox')} 
            className="flex items-center bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2 rounded-md transition-all"
            type="button"
          >
            <span className="mr-2">+</span> Checkbox Question
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Form Questions</h3>
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="w-full">
                {editingQuestion === question.id ? (
                  <QuestionEditor 
                    question={question}
                    onSave={handleSaveQuestion}
                    onCancel={() => setEditingQuestion(null)}
                  />
                ) : (
                  <QuestionItem 
                    question={question}
                    index={index}
                    totalQuestions={questions.length}
                    onEdit={() => setEditingQuestion(question.id)}
                    onDelete={() => handleRemoveQuestion(question.id)}
                    onMoveUp={() => handleMoveQuestion(index, 'up')}
                    onMoveDown={() => handleMoveQuestion(index, 'down')}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1f2b] p-6 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">No questions added yet. Use the buttons above to add questions to your form.</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end items-center border-t border-gray-700 pt-6">
        <button 
          className={`${
            loading 
              ? 'bg-blue-800 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors text-white px-6 py-2 flex justify-center items-center rounded-md shadow-lg`}
          onClick={handleSaveForm}
          disabled={loading}
          type="button"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Form'}
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;