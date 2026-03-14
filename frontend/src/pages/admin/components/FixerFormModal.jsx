import React from 'react';
import { User, Briefcase, X } from 'lucide-react';
import { motion } from 'motion/react';

const FixerForm = ({ title, onClose, onSave, initialData }) => {
  const categories = [
    'Car repair',
    'Motor repair',
    'Bicycle repair',
    'Electrical repair',
    'Plumbing',
    'Home fixing',
    'Other'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 relative my-8"
      >
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-8">{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Photo Upload Section */}
          <div className="md:col-span-4">
            <div className="aspect-square rounded-3xl border-2 border-dashed border-blue-100 bg-blue-50/30 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-blue-50 transition-colors">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                <User size={40} />
              </div>
              <span className="text-blue-600 font-semibold text-sm">Upload Photo</span>
            </div>
          </div>

          {/* Basic Info Fields */}
          <div className="md:col-span-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Michael"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="m.scott@example.com"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
              <input 
                type="text" 
                placeholder="+1 (555) 000-0000"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company name</label>
              <input 
                type="text" 
                placeholder="e.g.Bike company"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase size={20} className="text-blue-600" />
            <h3 className="font-bold text-lg">Professional Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                  <svg className="absolute w-4 h-4 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{cat}</span>
              </label>
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
              <input 
                type="text" 
                placeholder="e.g. Phnom Penh"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
              <input 
                type="text" 
                placeholder="e.g. 5"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Skills / Specializations</label>
              <input 
                type="text" 
                placeholder="Pipe fitting, Emergency repairs, Solar heaters..."
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Professional Bio</label>
              <textarea 
                rows={4}
                placeholder="Briefly describe the fixer's expertise and work history..."
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-10 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave({})}
            className="px-10 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {title.toLowerCase().includes('edit') ? 'Update' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FixerForm;