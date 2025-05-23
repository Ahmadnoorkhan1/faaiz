import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { Question } from '../../types';
import { toast } from 'react-hot-toast';

interface QuestionEditorProps {
  question: Question;
  onSave: (updatedQuestion: Question) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  question, 
  onSave, 
  onCancel 
}) => {
  const [text, setText] = useState(question.text);
  const [required, setRequired] = useState(question.required);
  const [options, setOptions] = useState<string[]>(question.options || []);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (!newOption.trim()) {
      toast.error('Option text cannot be empty');
      return;
    }
    setOptions([...options, newOption]);
    setNewOption('');
  };

  const handleDeleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Question text cannot be empty');
      return;
    }

    // For radio/checkbox, ensure we have at least one option
    if (question.type !== 'text' && options.length === 0) {
      toast.error('Please add at least one option');
      return;
    }

    onSave({
      ...question,
      text,
      required,
      options: question.type !== 'text' ? options : undefined
    });
  };

  return (
    <div className="bg-[#1a1f2b] p-4 rounded-lg shadow-lg border border-gray-700 w-full">
      <h3 className="text-gray-200 font-medium mb-3">Edit Question</h3>
      
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Question Text
        </label>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-[#242935] text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter question text..."
        />
      </div>

      <div className="mb-4 items-center hidden">
        <input 
          type="checkbox" 
          checked={required} 
          onChange={(e) => setRequired(e.target.checked)}
          className="mr-2"
        />
        <label className="text-gray-300 text-sm font-medium">
          Required Question
        </label>
      </div>

      {question.type !== 'text' && (
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Options
          </label>
          <ul className="mb-3 space-y-2">
            {options.map((option, idx) => (
              <li key={idx} className="flex items-center justify-between bg-[#2a303e] p-2 rounded">
                <span className="text-gray-200">{option}</span>
                <button 
                  onClick={() => handleDeleteOption(idx)}
                  className="text-red-400 hover:text-red-300"
                  type="button"
                >
                  <FaTrash size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex">
            <input 
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="flex-1 bg-[#242935] text-white px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add option..."
            />
            <button 
              onClick={handleAddOption}
              className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700"
              type="button"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={onCancel}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          type="button"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          type="button"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default QuestionEditor;