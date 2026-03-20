import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Map as MapIcon, Navigation, Plus, Minus, Compass, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function HeadingToCustomer() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-100">
      {/* Map Background Placeholder */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/sf-map/1200/800" 
          alt="Map" 
          className="w-full h-full object-cover grayscale opacity-60"
          referrerPolicy="no-referrer"
        />
        {/* Overlaying a simplified map graphic or just keeping the image */}
        <div className="absolute inset-0 bg-white/20 pointer-events-none" />
        
        {/* Route Line (Simplified SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <path 
            d="M 600 500 Q 700 450 800 550" 
            stroke="#FF7A1F" 
            strokeWidth="4" 
            strokeDasharray="8 8" 
            fill="none" 
          />
          {/* Vehicle Icon on Path */}
          <g transform="translate(700, 475)">
            <rect x="-10" y="-6" width="20" height="12" rx="2" fill="#FF7A1F" />
            <circle cx="6" cy="6" r="2" fill="black" />
            <circle cx="-6" cy="6" r="2" fill="black" />
          </g>
        </svg>

        {/* Destination Marker */}
        <div className="absolute left-[600px] top-[500px] -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-12 h-12 bg-[#FF7A1F]/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-white rounded-full border-4 border-[#FF7A1F]" />
          </div>
        </div>
      </div>

      {/* Floating UI Elements */}
      <div className="relative z-30 p-6 flex-1 flex flex-col pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Left: Heading Status Card */}
          <div className="w-80 bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto">
            <div className="bg-[#FF7A1F] p-4 flex items-center gap-3 text-white font-bold text-sm uppercase tracking-wider">
              <Navigation size={18} className="rotate-45" />
              <span>Heading to Customer</span>  
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#D1D5DB] rounded-full flex items-center justify-center overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Sarah Jenkins</h4>
                  <p className="text-xs text-gray-400">124 Willow Lane, Apt 4B</p>
                </div>
              </div>
              <button className="p-2 text-gray-300 hover:text-[#FF7A1F] transition-colors">
                <MapIcon size={20} />
              </button>
            </div>
          </div>

          {/* Right: Contact & Summary Card */}
          <div className="w-80 bg-white rounded-2xl shadow-xl p-6 space-y-6 pointer-events-auto">
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Contact Customer</h4>
              <p className="text-xs text-gray-400">Coordination & access instructions</p>
            </div>
            
            <button className="w-full bg-[#FF7A1F] hover:bg-[#E66D1C] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
              <Phone size={18} fill="white" />
              <span>Call Customer</span>
            </button>

           

            <div className="border-t border-gray-50 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800">Job Summary</h4>
                <span className="bg-[#FFF9F0] text-[#FF7A1F] text-[10px] font-bold px-2 py-1 rounded uppercase">Standard</span>
              </div>
              
              <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-300 mb-1">Est. Earnings</p>
                    <p className="text-xl font-bold text-[#FF7A1F]">$124.50</p>
                  </div>
                  <div className="text-gray-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-300 mb-1">Issue Description</p>
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    "Kitchen sink is leaking significantly from the P-trap. Water has started pooling under the cabinets. Needs immediate attention."
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-300">Order ID</p>
                  <p className="text-[10px] font-bold text-gray-800">#FIX-88421</p>
                </div>
              </div>
            </div>

            <button 
               onClick={() => navigate('/dashboard/fixer/jobs/navigation-map')}
              className="w-full border border-[#FF7A1F] text-[#FF7A1F] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FFF9F0] transition-all"
            >
              <Navigation size={18} className="rotate-45" />
              <span>Open Navigation</span>
            </button>
          </div>
        </div>

        {/* Map Controls (Bottom Left) */}
        <div className="mt-auto space-y-2 pointer-events-auto">
          <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden w-10">
            <button className="p-2.5 hover:bg-gray-50 border-b border-gray-100 text-gray-400"><Plus size={20} /></button>
            <button className="p-2.5 hover:bg-gray-50 text-gray-400"><Minus size={20} /></button>
          </div>
          <button className="p-2.5 bg-white rounded-lg shadow-lg text-[#FF7A1F] w-10 flex items-center justify-center">
            <Compass size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t border-gray-100 p-4 px-8 flex items-center justify-between z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF5ED] rounded-xl flex items-center justify-center text-[#FF7A1F]">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-300">Current Status</p>
              <p className="font-bold text-gray-800">On My Way</p>
            </div>
          </div>
          
          <div className="w-64">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[10px] uppercase font-bold text-gray-300">Distance Remaining</p>
              <p className="text-[10px] font-bold text-[#FF7A1F]">2.4 mi • 12 min</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF7A1F] w-3/4 rounded-full" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard/fixer/jobs/arrived-status')}
          className="bg-[#FF7A1F] hover:bg-[#E66D1C] text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#FF7A1F]/20 pointer-events-auto"
        >
          <CheckCircle2 size={20} />
          <span>I Have Arrived</span>
        </button>
      </div>
    </div>
  );
}
