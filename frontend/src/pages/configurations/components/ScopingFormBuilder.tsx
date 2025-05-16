import  { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../../../service/apiService';
import { useAuth } from '../../../utils/AuthContext';
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import toast from 'react-hot-toast';


const ScopingFormBuilder = ({selectedService, setShowFormBuilder}:{selectedService:string, setShowFormBuilder:any}) => {
  const [questions, setQuestions] = useState<any>([]);
  const {user} = useAuth() 
    const saveScopingForm = async() => {
        console.log({
            service: selectedService,
            questions: questions,
            createdById:user?.id,
          })
      const response:any = await api.post('/api/scoping-forms/create', {
        service: selectedService,
        questions: questions,
        createdById:user?.id,
      });
      if(response.success){
        toast.success('Scoping form created successfully');
      }else{
        toast.error('Failed to create scoping form');
      }
    }



  return (
    <div className="">
      <div className='flex justify-between items-center mb-8'>
      <h2 className="text-xl font-medium text-white">Scoping Form Builder</h2>
      <p className='text-gray-200'>{selectedService}</p>
      <button className='bg-red-400 cursor-pointer text-white h-8 w-8 flex justify-center items-center rounded-full' onClick={()=>setShowFormBuilder('Table')}>
        <FaArrowLeft />
      </button>
      </div>
      <div className="my-4 flex justify-end gap-4">
        <button onClick={() => addQuestion('text',setQuestions,questions)} className="cursor-pointer bg-blue-400 text-white px-3 py-1 rounded">
          + Text Question
        </button>
        <button onClick={() => addQuestion('radio',setQuestions,questions)} className="cursor-pointer bg-blue-700 text-white px-3 py-1 rounded">
          + Radio Question
        </button>
        <button onClick={() => addQuestion('checkbox',setQuestions,questions)} className="cursor-pointer bg-blue-900 text-white px-3 py-1 rounded">
          + Checkbox Question
        </button>
      </div>

      <div>
        {questions.map((q:any) => (
          <div key={q.id} className="mb-6 p-4 border rounded shadow-sm bg-[#242935] border-white">
            <div className='flex justify-end py-2'>
                <button className='bg-red-400 text-white px-3 py-1 rounded cursor-pointer' onClick={() => removeQuestion(q.id, setQuestions)}>
                    <FaTrash />
                </button>
            </div>
            <input
              type="text"
              className="border p-2 w-full mb-2 text-white"
              placeholder="Enter question text"
              value={q.text}
              onChange={(e) => updateQuestionText(q.id, e.target.value, setQuestions)}
            />

            {q.type !== 'text' && (
              <div className="space-y-2">
                {q.options.map((opt:any, idx:number) => (
                  <input
                    key={idx}
                    type="text"
                    className="border p-2 w-full text-white"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(q.id, idx, e.target.value, setQuestions)}
                  />
                ))}
                <button onClick={() => addOption(q.id, setQuestions)} className="text-blue-600 text-sm mt-1">
                  + Add Option
                </button>
              </div>
            )}

            <div className="mt-2 text-sm italic text-gray-500">Type: {q.type}</div>
          </div>
        ))}
        {
            questions.length === 0 && (
                <div className="text-gray-200 text-center py-16 my-6 border border-white rounded-md bg-[#242935]  ">
                    No questions added yet
                </div>
            )
        }
      </div>

      <div className='flex justify-end'>
        <button className='bg-blue-400 text-white px-3 py-1 rounded cursor-pointer' onClick={saveScopingForm}>Save</button>  
      </div>
    </div>
  );
};


export const addQuestion = (type:any, setQuestions:any, questions:any) => {
    const newQuestion = {
      id: uuidv4(),
      text: '',
      type,
      options: type === 'text' ? [] : [''],
    };
    setQuestions([...questions, newQuestion]);
  };

export  const updateQuestionText = (id:string, text:string, setQuestions:any) => {
    setQuestions((prev:any) =>
      prev.map((q:any) => (q.id === id ? { ...q, text } : q))
    );
  };

export const updateOption = (questionId:string, index:number, value:string, setQuestions:any) => {
    setQuestions((prev:any) =>
      prev.map((q:any) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt:any, i:number) => (i === index ? value : opt)),
            }
          : q
      )
    );
  };

export  const addOption = (questionId:any, setQuestions:any) => {
    setQuestions((prev:any) =>
      prev.map((q:any) =>
        q.id === questionId ? { ...q, options: [...q.options, ''] } : q
      )
    );
  };

  export const removeQuestion = (questionId:any, setQuestions:any) => {
    setQuestions((prev:any) =>
      prev.filter((q:any) => q.id !== questionId)
    );
  };

export default ScopingFormBuilder;

