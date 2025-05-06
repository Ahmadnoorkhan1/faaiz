import React from 'react';

interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative
                ${index <= currentStep ? 'bg-[#0078D4] text-white' : 'bg-[#003175] text-white/50'}`}
            >
              {index < currentStep ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 w-full h-0.5 left-1/2 
                  ${index < currentStep ? 'bg-[#0078D4]' : 'bg-[#003175]'}`}
              />
            )}
            
            <div className="text-center mt-2">
              <div className={`text-xs font-semibold ${index <= currentStep ? 'text-black' : 'text-black/50'}`}>
                {step.title}
              </div>
              <div className={`text-xs mt-1 ${index <= currentStep ? 'text-black/80' : 'text-black/40'}`}>
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mobile view - show only current step title */}
      <div className="md:hidden flex items-center justify-between bg-[#00204E] p-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#0078D4] text-white`}>
            {currentStep + 1}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{steps[currentStep].title}</div>
            <div className="text-xs text-white/80">{steps[currentStep].description}</div>
          </div>
        </div>
        <div className="text-xs text-white/50">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
