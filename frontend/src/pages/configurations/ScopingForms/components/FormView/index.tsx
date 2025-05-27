import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { ScopingForm } from '../../types';
import QuestionDisplay from './QuestionDisplay';

interface FormViewProps {
  selectedService: string;
  selectedForm: ScopingForm;
  onBack: () => void;
  onEdit: () => void;
}

const FormView: React.FC<FormViewProps> = ({ 
  selectedService, 
  selectedForm, 
  onBack, 
  onEdit 
}) => {
  console.log('am i comign here? 3')

  console.log(selectedForm,' <<<< ?' ,selectedForm, ' <<<< ?');
  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-white py-2">View Scoping Form</h2>
        <p className="text-gray-200">
          {selectedService}
        </p>
        <button 
          className="bg-red-400 cursor-pointer text-white h-8 w-8 flex justify-center items-center rounded-full" 
          onClick={onBack}
        >
          <FaArrowLeft />
        </button>
      </div>
      
      <div className="flex justify-end items-center my-4">
        <button 
          className="bg-blue-400 cursor-pointer text-white px-4 py-2 flex justify-center items-center rounded-md" 
          onClick={onEdit}
        >
          Edit Form
        </button>
      </div>
      
      <div className="flex justify-between items-start flex-col gap-4">
        {selectedForm.questions.map((question) => (
          <div key={question.id} className="flex w-full">
            <QuestionDisplay question={question} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormView;