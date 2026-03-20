import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

const WaitingConfirmation = ({ onConfirmed }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onConfirmed();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onConfirmed]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
      <div className="relative mb-12">
        {/* Radar Animation */}
        <div className="w-32 h-32 bg-violet-100 rounded-full flex items-center justify-center relative z-10">
          <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white">
            <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Pulsing Rings */}
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 bg-violet-400 rounded-full -z-0"
        />
        <motion.div
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-0 bg-violet-300 rounded-full -z-0"
        />
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-4">Waiting for Confirmation...</h2>
      <p className="text-slate-500 mb-12 max-w-md">
        We are notifying the best experts in <span className="text-violet-600 font-bold">Phnom Penh</span> near you.
      </p>

      <div className="flex flex-col items-center gap-6 w-full pt-12 border-t border-slate-50">
        <p className="text-xs text-slate-400 font-medium animate-pulse">Connecting with nearby professionals...</p>
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Wait</p>
          <div className="flex items-center gap-2 text-slate-800">
            <Clock className="w-5 h-5 text-violet-600" />
            <span className="text-xl font-bold">2-3 mins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingConfirmation;
