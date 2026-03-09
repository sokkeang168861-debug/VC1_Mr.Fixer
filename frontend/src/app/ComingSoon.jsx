import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Hammer } from 'lucide-react';

export default function ComingSoon({ title = "Page" }) {
  return (
    <div className="min-h-full flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto"
        >
          <Hammer size={48} className="animate-bounce" />
        </motion.div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">
            {title} <br />
            <span className="text-primary italic">Coming Soon</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Our team is working hard to bring you this feature. Check back in a few days!
          </p>
        </div>

        <Link
          to="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
}
