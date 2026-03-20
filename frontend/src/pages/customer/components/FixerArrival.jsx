import React from 'react';
import { Phone, MapPin, Bike, Clock, Navigation } from 'lucide-react';

const FixerArrival = ({ onArrived }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Bookings</h1>
        <p className="text-slate-500">Manage and track your service requests.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        {/* Booking Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
              <Bike className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Bicycle Repair</h2>
              <p className="text-sm text-slate-400 font-medium">Service ID: #HF-88219</p>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100">
            Fixer En Route
          </span>
        </div>

        {/* Expert Info */}
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-200 flex items-center justify-center overflow-hidden">
               <div className="w-8 h-8 bg-orange-400 rounded-sm"></div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Assigned Expert</p>
              <h4 className="font-bold text-slate-800">Marcus Henderson</h4>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-violet-600">
            <Phone className="w-4 h-4 fill-violet-600" />
            <span className="text-sm font-bold">+1 (555) 012-3456</span>
          </div>
        </div>

        {/* Live Tracking Map */}
        <div className="relative h-[400px] rounded-[24px] overflow-hidden border border-slate-100">
          <img
            src="https://picsum.photos/seed/tracking-map/1200/800"
            alt="Tracking Map"
            className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
            referrerPolicy="no-referrer"
          />
          
          {/* Mock Route Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Route Line (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 300 150 Q 400 250 600 300"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="6"
                  strokeDasharray="12 8"
                  className="opacity-60"
                />
              </svg>

              {/* Start Point */}
              <div className="absolute top-[140px] left-[290px]">
                <div className="w-6 h-6 bg-violet-600 rounded-full border-4 border-white shadow-lg"></div>
              </div>

              {/* Fixer Icon (Moving) */}
              <div className="absolute top-[290px] left-[590px]">
                <div className="w-10 h-10 bg-slate-900 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white">
                  <Navigation className="w-5 h-5 rotate-45 fill-white" />
                </div>
              </div>

              {/* Destination Point */}
              <div className="absolute top-[340px] left-[670px]">
                <div className="w-10 h-10 bg-slate-800 rounded-xl border-4 border-white shadow-lg flex items-center justify-center text-white">
                  <MapPin className="w-5 h-5 fill-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">Your Location</div>
              </div>

              {/* ETA Label */}
              <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col gap-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Arriving in 12 mins</p>
                <p className="text-sm font-bold text-slate-800">2.4 miles left</p>
              </div>

              {/* Map Center Label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <h3 className="text-4xl font-bold text-slate-800 opacity-80 pointer-events-none">San Francisco</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Action: Fixer Arrived */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onArrived}
          className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200"
        >
          Fixer Arrived
        </button>
      </div>
    </div>
  );
};

export default FixerArrival;
