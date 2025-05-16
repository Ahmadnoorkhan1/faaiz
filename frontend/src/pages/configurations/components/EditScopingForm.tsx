import React, { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { renderQuestion } from './ViewScopingForm';
import { addQuestion } from './ScopingFormBuilder';

interface EditScopingFormProps {
    selectedService: string;
    setShowFormBuilder: (showFormBuilder: string) => void;
    selectedForm: any;
}

const EditScopingForm = ({selectedService, setShowFormBuilder, selectedForm}:EditScopingFormProps) => {
    const [questions,setQuestions] = useState([]);
    const handleUpdateScopingForm = () => {
        console.log('update scoping form');
    }
  return (
    <div>
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-white py-2">Edit Scoping Form</h2>
            <p className="text-gray-200">{selectedService}</p>
            <button className="bg-red-400 cursor-pointer text-white h-8 w-8 flex justify-center items-center rounded-full" onClick={()=>setShowFormBuilder('Table')}>
                <FaArrowLeft />
            </button>
        </div>
        <div className="flex justify-end items-center my-4">
            <button className="bg-blue-400 cursor-pointer text-white px-4 py-2 flex justify-center items-center rounded-md" onClick={()=>setShowFormBuilder('View')}>
                View Form
            </button>
            {/* ADD BUTTON FOR NEW QUESTIONS */}
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

        <div className="flex justify-between items-start flex-col gap-4">
            {selectedForm.questions.map((question:any)=>{
                return(
                    <div key={question.id} className="flex w-full">
                        {renderQuestion(question)}
                    </div>
                )
            })}
        </div>
        <div className="flex justify-end items-center my-4">
            <button className="bg-blue-400 cursor-pointer text-white px-4 py-2 flex justify-center items-center rounded-md" onClick={()=>handleUpdateScopingForm()}>
                Save Changes
            </button>
        </div>
    </div>
  )
}

export default EditScopingForm