import React from 'react';
import { Search, User, CreditCard, Send, CheckCircle2 } from 'lucide-react';

const ProgressBar = ({ currentStep = 1 }) => {
  const steps = [
    { icon: Search, label: 'CHOOSE ISSUE', step: 1 },
    { icon: User, label: 'FIND FIXER', step: 2 },
    { icon: CreditCard, label: 'CONFIRM PRICE', step: 3 },
    { icon: Send, label: 'FIXER ARRIVAL', step: 4 },
    { icon: CheckCircle2, label: 'COMPLETE', step: 5 },
  ];

  return (
    <div className="flex items-center justify-center w-full py-8 mb-8">
      <div className="flex items-center gap-0">
        {steps.map((step, index) => {
          const isActive = Math.floor(step.step) === Math.floor(currentStep);
          const isCompleted = step.step < Math.floor(currentStep);

          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-2 w-32 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                      : isCompleted
                      ? 'bg-violet-100 text-violet-600'
                      : 'bg-white border-2 border-gray-100 text-gray-400'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wider ${
                    isActive
                      ? 'text-violet-600'
                      : isCompleted
                      ? 'text-violet-400'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-20 h-[2px] -mt-6 ${
                    isCompleted ? 'bg-violet-200' : 'bg-gray-100'
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;