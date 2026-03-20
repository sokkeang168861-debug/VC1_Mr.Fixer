import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Plus, Minus, Compass, Info } from 'lucide-react';

export default function NavigationMap() {
  const navigate = useNavigate();
  
  const handleExitNavigation = () => {
    console.log('Exit Navigation button clicked');
    navigate('/dashboard/fixer/jobs/heading-to-customer');
  };
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col relative overflow-hidden bg-[#A8D5BA]">
      {/* Map Background Placeholder (Colored) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/sf-map-color/1200/800" 
          alt="Map" 
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
        
        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <path 
            d="M 600 500 Q 700 450 800 550" 
            stroke="#FF7A1F" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>

        {/* Current Position Marker */}
        <div className="absolute left-[600px] top-[500px] -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-16 h-16 bg-[#FF7A1F]/30 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full border-4 border-[#FF7A1F]" />
          </div>
        </div>
      </div>

      {/* Floating UI Elements */}
      <div className="relative z-30 p-6 flex-1 flex flex-col pointer-events-none">
        {/* Turn Instruction Card */}
        <div className="w-96 bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex">
          <div className="bg-[#FF7A1F] p-6 flex items-center justify-center text-white">
            <Navigation size={32} className="rotate-90" />
          </div>
          <div className="p-6 flex-1">
            <p className="text-[10px] uppercase font-bold text-[#FF7A1F] tracking-widest mb-1">In 500 Meters</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">Turn Right onto Main St</h3>
            <p className="text-xs text-gray-400">Follow the orange route</p>
          </div>
        </div>

        {/* Map Controls (Top Right) */}
        <div className="absolute top-6 right-6 space-y-2 pointer-events-auto">
          <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden w-10">
            <button className="p-2.5 hover:bg-gray-50 border-b border-gray-100 text-gray-400"><Plus size={20} /></button>
            <button className="p-2.5 hover:bg-gray-50 text-gray-400"><Minus size={20} /></button>
          </div>
          <button className="p-2.5 bg-white rounded-lg shadow-lg text-[#FF7A1F] w-10 flex items-center justify-center">
            <Compass size={20} />
          </button>
        </div>

        {/* Bottom Info Cards */}
        <div className="mt-auto flex items-end justify-between pointer-events-auto">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 min-w-[240px]">
            <div className="relative">
              <div className="w-12 h-12 bg-[#D1D5DB] rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=jane" alt="Jane" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">Jane Doe</h4>
              <p className="text-[10px] text-gray-400">Service: <span className="text-[#FF7A1F]">Sink Repair</span></p>
            </div>
            <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors">
              <Info size={18} />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center min-w-[140px] border-b-4 border-[#FF7A1F]">
              <p className="text-[10px] uppercase font-bold text-gray-300 mb-1 tracking-wider">Time to Arrival</p>
              <p className="text-3xl font-bold text-[#FF7A1F]">8 mins</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center min-w-[140px]">
              <p className="text-[10px] uppercase font-bold text-gray-300 mb-1 tracking-wider">Distance</p>
              <p className="text-3xl font-bold text-gray-800">2.4 km</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
