import React from 'react';
import { CheckCircle2, ReceiptText } from 'lucide-react';

const ServiceCompleted = ({ onPayment }) => {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Service Completed!</h1>
        <p className="text-slate-500">Your repair has been successfully finalized by the fixer.</p>
      </div>

      {/* Receipt Card */}
      <div className="w-full bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 mb-8">
        <div className="flex items-center gap-2 text-violet-600 mb-4">
          <ReceiptText className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Official Receipt</span>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-1">Order #MF-88291</h2>
        <p className="text-sm text-slate-400 font-medium mb-8">{today} • {time}</p>

        <div className="border-t border-dashed border-slate-200 pt-8 mb-8">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center overflow-hidden">
               <img src="https://picsum.photos/seed/fixer-avatar/100/100" alt="Fixer" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Bicycle Repair</h4>
              <p className="text-xs text-slate-400">Service Provider: Marcus Henderson</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-slate-600">
              <span>Base Service Fee</span>
              <span className="font-medium">$60.00</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Materials & Parts</span>
              <span className="font-medium">$15.40</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes (5%)</span>
              <span className="font-medium">$3.77</span>
            </div>
          </div>

          <div className="border-t border-violet-100 pt-6 flex justify-between items-center">
            <span className="text-xl font-bold text-slate-800">Total Amount Paid</span>
            <span className="text-3xl font-bold text-violet-600">$79.17</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onPayment}
        className="w-full max-w-sm py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl"
      >
        Go to payment
      </button>
    </div>
  );
};

export default ServiceCompleted;
