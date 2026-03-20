import React from 'react';
import { X, Star, Store, Clock, MapPin, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ExpertProfileModal = ({ isOpen, onClose, expert, onBook }) => {
  if (!expert) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Expert Profile</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
              <div className="flex items-start gap-6 mb-8">
                <div className="relative">
                  <img
                    src={expert.image}
                    alt={expert.name}
                    className="w-24 h-24 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">{expert.name}</h3>
                  <div className="flex items-center gap-2 text-violet-600 mb-3">
                    <Store className="w-4 h-4" />
                    <span className="text-sm font-medium">The Master Workshop</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                      <span className="font-bold text-slate-800">{expert.rating}</span>
                    </div>
                    <span className="text-slate-400 text-sm">• {expert.reviews} Verified Reviews</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-8">
                {['PLUMBING', 'ELECTRICAL'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold tracking-widest rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-violet-50/50 rounded-2xl p-6 mb-8 border border-violet-100/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-violet-400 tracking-widest uppercase">Estimated Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-violet-600">$68.50</span>
                    <p className="text-[10px] text-violet-400 uppercase font-bold mt-1">Tax inclusive</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-violet-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Base Fee</p>
                    <p className="font-bold text-slate-800">$45.00</p>
                  </div>
                  <div className="border-l border-violet-100 pl-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Distance</p>
                    <p className="font-bold text-slate-800">+$12.50</p>
                  </div>
                  <div className="border-l border-violet-100 pl-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Urgency</p>
                    <p className="font-bold text-slate-800">+$11.00</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shop Location & Arrival</h4>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">18 min ETA</span>
                  </div>
                </div>
                <div className="relative h-24 rounded-xl overflow-hidden mb-3">
                  <img
                    src="https://picsum.photos/seed/map/800/400"
                    alt="Map"
                    className="w-full h-full object-cover opacity-50 grayscale"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-600">452 Valencia St, San Francisco, CA 94103</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Reviews</h4>
                  <button className="text-xs font-bold text-violet-600">See All</button>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">Jason M.</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 text-orange-400 fill-orange-400" />)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    "Marcus fixed our kitchen leak in no time. Very professional and clean work. Highly recommended!"
                  </p>
                </div>
              </div>

              <button 
                onClick={onBook}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200"
              >
                Book {expert.name.split(' ')[0]} for $68.50
                <Zap className="w-4 h-4 fill-white" />
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">Usually responds in under 5 minutes</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExpertProfileModal;
