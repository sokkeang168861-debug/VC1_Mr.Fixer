import React, { useState } from 'react';
import { Zap, MapPin, Calendar, Clock, CheckCircle2, ShieldCheck, ArrowLeft, Info, Star } from 'lucide-react';

const BookingAgreement = ({ onConfirm, onReject }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Booking Agreement</h1>
        <p className="text-slate-500">Review fixer proposal. No payment is required right now.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Booking Review Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Booking Review</h3>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selected Service</p>
                  <h4 className="font-bold text-slate-800">Electrical Repair</h4>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                    alt="Marcus"
                    className="w-12 h-12 rounded-xl object-cover grayscale-[0.2]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmed Expert</p>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-slate-800">Sparky's Professional Solutions</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                    <span className="text-[10px] font-bold text-slate-700">4.9</span>
                    <span className="text-[10px] text-slate-400">(128 reviews)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date & Time</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold">Oct 24, 2023 • 14:00</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold">123 Maple St, North Wing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Service Terms & Final Agreement</h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <p className="text-sm text-slate-500 mb-4">By confirming this booking, you agree to the following terms:</p>
              <ul className="flex flex-col gap-3">
                {[
                  "The expert will arrive within the 30-minute window of your scheduled time.",
                  "The final price reflects the labor and base fees agreed upon during Step 4.",
                  "Additional materials required during the repair will be billed separately.",
                  "Cancellations within 2 hours of the appointment may incur a small fee."
                ].map((term, i) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-500 leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-violet-300 rounded-full mt-1.5 shrink-0"></div>
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            <label className="flex items-start gap-4 p-4 bg-violet-50/50 rounded-2xl border border-violet-100/50 cursor-pointer group transition-colors hover:bg-violet-50">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-violet-600 checked:bg-violet-600"
                />
                <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none p-0.5" />
              </div>
              <span className="text-xs font-medium text-slate-600 leading-relaxed">
                I have reviewed the service details and agree to the final price and service terms mentioned above.
              </span>
            </label>

            <div className="mt-6 flex items-center gap-3 p-4 bg-violet-50 rounded-2xl text-violet-600">
              <Info className="w-5 h-5" />
              <p className="text-xs font-bold">Payment will be handled after the service is completed.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onReject}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Reject
            </button>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Secure Booking
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 sticky top-8">
          <h3 className="font-bold text-slate-800 mb-8">Booking Summary</h3>
          
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Base Service Fee</span>
              <span className="font-bold text-slate-800">$45.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Expert Labor (Fixed)</span>
              <span className="font-bold text-slate-800">$30.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Service Charge</span>
              <span className="font-bold text-slate-800">$4.99</span>
            </div>
            <div className="flex justify-between items-center text-sm text-emerald-600 font-bold">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 fill-emerald-600" />
                <span>Applied Discount</span>
              </div>
              <span>-$5.00</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 mb-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xl font-bold text-slate-800">Total Amount</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Tax included in final total</p>
              </div>
              <span className="text-3xl font-bold text-violet-600">$74.99</span>
            </div>
          </div>

          <button
            disabled={!agreed}
            onClick={onConfirm}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${
              agreed
                ? 'bg-violet-600 text-white shadow-violet-200 hover:bg-violet-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Confirm Booking
          </button>
          
          <p className="text-center text-[10px] text-slate-400 mt-6 leading-relaxed">
            No payment required now. Pay directly to the expert via the app once the job is finished.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingAgreement;
