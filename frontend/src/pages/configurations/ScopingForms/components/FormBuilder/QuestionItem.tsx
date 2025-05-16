import React from 'react';
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash } from 'react-icons/fa';
import { Question } from '../../types';
import QuestionDisplay from '../FormView/QuestionDisplay';

interface QuestionItemProps {
  question: Question;
  index: number;
  totalQuestions: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  totalQuestions,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  return (
    <div className="bg-[#1a1f2b] p-4 rounded-lg shadow-lg border border-gray-700 w-full relative group">
      <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onMoveUp}
          className="text-gray-400 hover:text-white p-1"
          disabled={index === 0}
          type="button"
        >
          <FaArrowUp size={14} />
        </button>
        <button 
          onClick={onMoveDown}
          className="text-gray-400 hover:text-white p-1"
          disabled={index === totalQuestions - 1}
          type="button"
        >
          <FaArrowDown size={14} />
        </button>
        <button 
          onClick={onEdit}
          className="text-blue-400 hover:text-blue-300 p-1"
          type="button"
        >
          <FaEdit size={14} />
        </button>
        <button 
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 p-1"
          type="button"
        >
          <FaTrash size={14} />
        </button>
      </div>
      
      <div className="pr-24">
        <QuestionDisplay question={question} />
      </div>
      
      <div className="mt-2 flex items-center text-xs text-gray-400">
        <span className={`px-2 py-0.5 rounded-full ${question.required ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>
          {question.required ? 'Required' : 'Optional'}
        </span>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-700">
          {question.type === 'text' ? 'Text Input' : 
            question.type === 'radio' ? 'Single Choice' : 'Multiple Choice'}
        </span>
      </div>
    </div>
  );
};

export default QuestionItem;