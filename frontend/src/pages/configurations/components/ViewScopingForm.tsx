import { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa"

const ViewScopingForm = ({selectedService, setShowFormBuilder, selectedForm}:{selectedService:string, setShowFormBuilder:any, selectedForm:any}) => {   
  useEffect(()=>{
    console.log(selectedForm);
  },[selectedService]);

 
    return (
    <div>
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-white py-2">View Scoping Form</h2>
            <p className="text-gray-200">{selectedService}</p>
            <button className="bg-red-400 cursor-pointer text-white h-8 w-8 flex justify-center items-center rounded-full" onClick={()=>setShowFormBuilder('Table')}>
                <FaArrowLeft />
            </button>
        </div>
        <div className="flex justify-end items-center my-4">
            <button className="bg-blue-400 cursor-pointer text-white px-4 py-2 flex justify-center items-center rounded-md" onClick={()=>setShowFormBuilder('Edit')}>
                Edit Form
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
    </div> 
  )
}

export const renderQuestion = (question:any) =>{
    switch(question.type){
        case 'text':
            return(
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-gray-200">{question.text}</p>
                    <input type="text" className="bg-gray-800 text-white p-2 rounded-md" />
                </div>
            )
        case 'radio':
            return(
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-gray-200">{question.text}</p>
                    {question.options.map((option:any, index:number)=>{
                        return(
                            <div className="flex items-center gap-2" key={index}>
                                <input type="radio" className="bg-gray-800 text-white p-2 rounded-md" />
                                <p className="text-gray-200">{option}</p>
                            </div>
                        )
                    })}
                </div>
            )
        case 'checkbox':
            return(
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-gray-200">{question.text}</p>
                    {question.options.map((option:any, index:number)=>{
                        return(
                            <div className="flex items-center gap-2" key={index}>
                                <input type="checkbox" className="bg-gray-800 text-white p-2 rounded-md" />
                                <p className="text-gray-200">{option}</p>
                            </div>
                        )
                    })}
                </div>
            )
        default:
            return null;
    }
  }


export default ViewScopingForm