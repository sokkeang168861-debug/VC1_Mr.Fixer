import React from 'react';
import { Check, Star, History } from 'lucide-react';

const FeedbackSuccess = ({ onGoToHistory }) => {
  return (
    <div className="max-w-4xl mx-auto min-h-[600px] flex items-center justify-center">
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-16 w-full text-center flex flex-col items-center">
        <div className="relative mb-12">
          {/* Main Success Icon */}
          <div className="w-32 h-32 bg-violet-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-violet-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-violet-600">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
          </div>
          
          {/* Floating Star Badge */}
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="absolute -top-2 -right-2 w-12 h-12 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg z-20"
          >
            <Star className="w-6 h-6 fill-white" />
          </motion.div>

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-violet-400 blur-[60px] opacity-20 rounded-full -z-0 scale-150" />
        </div>

        <h1 className="text-6xl font-black text-slate-800 mb-8 tracking-tight">
          Thank You for Your Feedback!
        </h1>
        
        <p className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-12">
          Your review for <span className="text-violet-600 font-bold">Marcus Henderson</span> has been shared with the community. It helps others find great fixers like him.
        </p>

        <button 
          onClick={onGoToHistory}
          className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-violet-100 rounded-2xl text-violet-600 font-bold text-lg hover:bg-violet-50 transition-all shadow-sm"
        >
          <History className="w-6 h-6" />
          Go to History
        </button>
      </div>
    </div>
  );
};

export default FeedbackSuccess;
