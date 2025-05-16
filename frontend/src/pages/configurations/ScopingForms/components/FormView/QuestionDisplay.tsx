import React from 'react';
import { Question } from '../../types';

interface QuestionDisplayProps {
  question: Question;
  index?: number; // Optional index for numbering questions
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, index }) => {
  const renderQuestionByType = () => {
    switch (question.type) {
      case 'text':
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap items-start mb-3">
              <div className="flex-grow pr-16"> {/* Added right padding to prevent overlap */}
                <p className="text-gray-100 text-base font-medium leading-relaxed">
                  {index !== undefined && <span className="text-blue-400 mr-2">{index + 1}.</span>}
                  {question.text}
                </p>
              </div>
              {question.required && (
                <span className="px-2 py-0.5 bg-red-900/30 text-red-300 text-xs font-medium rounded-full absolute right-6 top-6">
                  Required
                </span>
              )}
            </div>
            <div className="w-full mt-4"> {/* Increased margin top for better spacing */}
              <input 
                type="text" 
                disabled 
                className="w-full bg-[#242935] text-gray-400 px-4 py-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                placeholder="Text answer will appear here"
                aria-label={`Answer for ${question.text}`}
              />
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap items-start mb-3">
              <div className="flex-grow pr-16"> {/* Added right padding to prevent overlap */}
                <p className="text-gray-100 text-base font-medium leading-relaxed">
                  {index !== undefined && <span className="text-blue-400 mr-2">{index + 1}.</span>}
                  {question.text}
                </p>
              </div>
              {question.required && (
                <span className="px-2 py-0.5 bg-red-900/30 text-red-300 text-xs font-medium rounded-full absolute right-6 top-6">
                  Required
                </span>
              )}
            </div>
            <div className="space-y-3 mt-4 w-full"> {/* Increased margin top and added full width */}
              {question.options?.map((option, idx) => (
                <label key={idx} className="flex items-center gap-3 py-1.5 px-2 cursor-default group hover:bg-[#242935] rounded-md w-full transition-colors">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="h-5 w-5 rounded-full border-2 border-gray-600 group-hover:border-blue-500 transition-colors"></div>
                    <div className="absolute h-2.5 w-2.5 rounded-full bg-blue-500 opacity-0"></div>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-100 transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap items-start mb-3">
              <div className="flex-grow pr-16"> {/* Added right padding to prevent overlap */}
                <p className="text-gray-100 text-base font-medium leading-relaxed">
                  {index !== undefined && <span className="text-blue-400 mr-2">{index + 1}.</span>}
                  {question.text}
                </p>
              </div>
              {question.required && (
                <span className="px-2 py-0.5 bg-red-900/30 text-red-300 text-xs font-medium rounded-full absolute right-6 top-6">
                  Required
                </span>
              )}
            </div>
            <div className="space-y-3 mt-4 w-full"> {/* Increased margin top and added full width */}
              {question.options?.map((option, idx) => (
                <label key={idx} className="flex items-center gap-3 py-1.5 px-2 cursor-default group hover:bg-[#242935] rounded-md w-full transition-colors">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="h-5 w-5 rounded border-2 border-gray-600 group-hover:border-blue-500 transition-colors"></div>
                    <svg className="absolute w-3 h-3 text-blue-500 opacity-0 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-100 transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1f2b] to-[#1d2231] p-6 pt-8 rounded-lg shadow-md border border-gray-800/60 transition-all mb-6 hover:shadow-lg w-full relative">
    
      {renderQuestionByType()}
    </div>
  );
};

export default QuestionDisplay;