import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, Info } from 'lucide-react';

export default function JobCompleted() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard/fixer/jobs');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-100px)] space-y-12">
      {/* Success Icon */}
      <div className="relative">
        <div className="w-24 h-24 bg-[#FF7A1F] rounded-full flex items-center justify-center text-white shadow-2xl shadow-[#FF7A1F]/40 border-8 border-white">
          <Check size={48} strokeWidth={3} />
        </div>
        <div className="absolute -inset-4 bg-[#FF7A1F]/10 rounded-full -z-10 animate-pulse" />
      </div>

      {/* Title Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-gray-800 tracking-tight">Job Successfully Completed!</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Great work! The customer has been notified and your payment is processing.
        </p>
      </div>

      {/* Info Cards Container */}
      <div className="flex gap-6 w-full max-w-4xl">
        {/* Left Card: Job Details */}
        <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm p-10 space-y-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest mb-2">Job Identification</p>
              <h3 className="text-3xl font-bold text-gray-800">#FIX-9921</h3>
            </div>
            <span className="bg-[#FFF9F0] text-[#FF7A1F] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Paid</span>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest mb-2">Customer</p>
              <p className="text-xl font-bold text-gray-800">Jane Cooper</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest mb-2">Service Type</p>
              <p className="text-xl font-bold text-gray-800">AC Repair</p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF5ED] rounded-xl flex items-center justify-center text-[#FF7A1F]">
              <ShieldCheck size={20} />
            </div>
            <p className="text-sm font-bold text-gray-600">Warranty activated for 90 days</p>
          </div>
        </div>

        {/* Right Card: Earnings */}
        <div className="w-72 bg-[#FF7A1F] rounded-[32px] shadow-2xl shadow-[#FF7A1F]/30 p-10 flex flex-col items-center justify-center text-center text-white space-y-6">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest mb-4">Total Earned</p>
            <div className="relative inline-block">
              <h2 className="text-5xl font-bold">$124.50</h2>
              <div className="h-1.5 bg-black/20 w-full mt-2 rounded-full" />
            </div>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            Funds will be available in your dashboard within 24 hours.
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
        <Info size={14} />
        <span>Confirmation sent to jane.cooper@example.com</span>
      </div>
    </div>
  );
}
