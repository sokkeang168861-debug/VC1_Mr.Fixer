import React, { useState } from 'react';
import { CheckCircle2, Star, Download, Send } from 'lucide-react';

const PaymentProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'CONFIRMED' },
    { id: 2, label: 'PAYMENT' },
    { id: 3, label: 'RECEIPT' },
  ];

  return (
    <div className="flex items-center justify-center gap-12 mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all ${
              currentStep > step.id 
                ? 'bg-violet-600 border-violet-600 text-white' 
                : currentStep === step.id 
                  ? 'bg-white border-violet-600 text-violet-600 shadow-lg shadow-violet-100' 
                  : 'bg-white border-slate-100 text-slate-300'
            }`}>
              {currentStep > step.id ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : step.id}
            </div>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${
              currentStep >= step.id ? 'text-violet-600' : 'text-slate-300'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 w-16 rounded-full ${
              currentStep > step.id ? 'bg-violet-600' : 'bg-slate-100'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const RatingStars = ({ count = 5 }) => {
  return (
    <div className="flex gap-1">
      {[...Array(count)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-slate-200 hover:text-amber-400 cursor-pointer transition-colors" />
      ))}
    </div>
  );
};

const PaymentSuccess = ({ onSubmitReview }) => {
  const [overallRating, setOverallRating] = useState(0);

  return (
    <div className="max-w-5xl mx-auto">
      <PaymentProgressBar currentStep={3} />
      
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 mb-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Payment Successfully!</h1>
          <p className="text-slate-500">Your repair has been successfully finalized by the fixer.</p>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 mb-8">
          <div className="flex items-center gap-2 text-violet-600 mb-6">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Order Summary</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Order Number</span>
              <span className="font-bold text-slate-800">#MF-88291</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Service</span>
              <span className="font-bold text-slate-800">Bicycle Repair</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-800 font-bold">Total Paid</span>
              <span className="text-2xl font-bold text-violet-600">$79.17</span>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8">
          <div className="flex items-center gap-2 text-violet-600 mb-8">
            <Star className="w-5 h-5 fill-violet-600" />
            <h3 className="text-xl font-bold text-slate-800">Rate Your Experience</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Rating</p>
              {[
                { label: 'QUALITY' },
                { label: 'SPEED' },
                { label: 'PRICE' },
                { label: 'BEHAVIOR' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider">{item.label}</span>
                  <RatingStars />
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Feedback:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-10 h-10 cursor-pointer transition-all ${
                      overallRating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                    onClick={() => setOverallRating(star)}
                  />
                ))}
              </div>
              <textarea 
                placeholder="Please help to share your feedback of our service..."
                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all resize-none"
              />
            </div>
          </div>

          <button 
            onClick={onSubmitReview}
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-100 flex items-center justify-center gap-2"
          >
            Submit Review
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
          <Download className="w-4 h-4" />
          Download PDF Receipt
        </button>
        <button className="px-10 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
          Done
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
