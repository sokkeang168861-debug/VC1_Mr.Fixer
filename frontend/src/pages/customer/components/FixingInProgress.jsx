import React, { useEffect } from 'react';
import { Target } from 'lucide-react';

const FixingInProgress = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
      <div className="relative mb-12">
        {/* Target Animation */}
        <div className="w-32 h-32 bg-violet-100 rounded-full flex items-center justify-center relative z-10">
          <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white">
            <Target className="w-6 h-6" />
          </div>
        </div>
        
        {/* Pulsing Rings */}
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 bg-violet-400 rounded-full -z-0"
        />
        <motion.div
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
          className="absolute inset-0 bg-violet-300 rounded-full -z-0"
        />
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-6">Marcus is currently fixing your issue</h2>
      <p className="text-slate-500 max-w-2xl leading-relaxed">
        He is actively reviewing the details and working toward a solution. We'll keep you updated on the progress and notify you as soon as everything is resolved. Thank you for your patience and understanding.
      </p>
    </div>
  );
};

export default FixingInProgress;
