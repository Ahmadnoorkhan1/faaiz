import React from "react";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div
                className={`flex flex-col items-center ${
                  onStepClick ? "cursor-pointer hover:opacity-90" : ""
                }`}
                onClick={() => onStepClick?.(index)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index < currentStep
                      ? "bg-primary-500 text-black ring-4 ring-primary-100"
                      : index === currentStep
                      ? "bg-primary-500 text-black ring-4 ring-primary-100"
                      : "bg-neutral-100 text-neutral-400 border border-neutral-300"
                  }`}
                >
                  {index < currentStep ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className={`mt-2 text-sm font-medium ${
                  index === currentStep ? "text-primary-700" : "text-neutral-900"
                }`}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="mt-1 text-xs text-neutral-500">
                    {step.description}
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentStep 
                      ? "bg-primary-500" 
                      : "bg-neutral-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="text-sm font-medium text-primary-700">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-xs text-neutral-500">
              {steps[currentStep].title}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center ring-4 ring-primary-100">
            {currentStep + 1}
          </div>
        </div>
        <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Stepper;
