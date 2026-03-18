import React from 'react';
import { motion as Motion } from 'motion/react';

const ProgressBar = ({ currentStep }) => {
  const steps = 6; // Total steps for the progress bar
  const progress = (currentStep / steps) * 100;

  return (
    <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
      <Motion.div
        className="h-full bg-violet-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ProgressBar;