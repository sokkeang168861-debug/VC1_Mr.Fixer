import React, { useState } from 'react';
import { Car, Bike, Settings, Refrigerator, Droplets, Zap, Camera, Calendar, Zap as ZapIcon, AlertCircle, ArrowRight } from 'lucide-react';

const BookingForm = ({ onNext }) => {
  const [selectedCategory, setSelectedCategory] = useState('Car Repair');
  const [urgency, setUrgency] = useState('Normal');

  const categories = [
    { id: 'Car Repair', icon: Car, label: 'Car Repair', desc: 'Engine, tires & body work' },
    { id: 'Motor/Bike Repair', icon: Bike, label: 'Motor/Bike Repair', desc: 'Performance & part swap' },
    { id: 'Bicycle Maintenance', icon: Settings, label: 'Bicycle Maintenance', desc: 'Chain, brake & gear checks' },
    { id: 'Home Appliances', icon: Refrigerator, label: 'Home Appliances', desc: 'Fridge, washer & electronics' },
    { id: 'Plumbing', icon: Droplets, label: 'Plumbing', desc: 'Leaks, pipes & drain issues' },
    { id: 'Electrical', icon: Zap, label: 'Electrical', desc: 'Wiring, lighting & safety' },
  ];

  const urgencyOptions = [
    { id: 'Normal', icon: Calendar, label: 'Normal', desc: 'Within a few days. Best for minor fixes.', color: 'violet' },
    { id: 'Urgent', icon: ZapIcon, label: 'Urgent', desc: 'Within 24 hours. Needs quick attention.', color: 'orange' },
    { id: 'Emergency', icon: AlertCircle, label: 'Emergency', desc: 'ASAP. For critical issues or safety risks.', color: 'red' },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10 mb-20">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">What can we help you fix today?</h1>
        <p className="text-slate-500">Select a category that best describes your maintenance or repair need.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-200 group ${
              selectedCategory === cat.id
                ? 'border-violet-500 bg-violet-50/30'
                : 'border-gray-100 hover:border-violet-200'
            }`}
          >
            <cat.icon
              className={`w-8 h-8 mb-4 transition-colors ${
                selectedCategory === cat.id ? 'text-violet-600' : 'text-slate-400 group-hover:text-violet-400'
              }`}
            />
            <h3 className="font-bold text-slate-800 mb-1">{cat.label}</h3>
            <p className="text-xs text-slate-400 text-center">{cat.desc}</p>
          </button>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 mb-4">What's the problem?</h2>
        <textarea
          placeholder="e.g., My kitchen sink is leaking from the base and the wood underneath is damp. It seems to happen only when the faucet is running..."
          className="w-full h-32 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Photos <span className="font-normal text-slate-400">(Optional)</span>
        </h2>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-800 mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-400">PNG, JPG or WEBP (max. 10MB each)</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How soon do you need help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {urgencyOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setUrgency(opt.id)}
              className={`flex flex-col p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                urgency === opt.id
                  ? 'border-violet-500 bg-violet-50/30'
                  : 'border-gray-100 hover:border-violet-200'
              }`}
            >
              <opt.icon
                className={`w-5 h-5 mb-4 ${
                  opt.color === 'violet'
                    ? 'text-violet-500'
                    : opt.color === 'orange'
                    ? 'text-orange-500'
                    : 'text-red-500'
                }`}
              />
              <h3 className="font-bold text-slate-800 mb-2">{opt.label}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-6 border-t border-slate-50">
        <button
          onClick={onNext}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-12 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300 active:scale-95"
        >
          Next: Find an Expert
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BookingForm;