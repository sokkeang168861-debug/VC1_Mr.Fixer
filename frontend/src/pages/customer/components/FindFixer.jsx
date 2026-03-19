import React, { useState } from 'react';
import { Search, MapPin, Layers, Star, ShieldCheck, Plus, Minus, Navigation, Info } from 'lucide-react';
import ExpertProfileModal from './ExpertProfileModal';

const FindFixer = ({ onBook }) => {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fixers = [
    {
      id: 1,
      name: 'Alex Rivera',
      rating: 4.9,
      reviews: 124,
      distance: '0.8 miles away',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'Marcus Chen',
      rating: 4.8,
      reviews: 89,
      distance: '1.2 miles away',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    },
    {
      id: 3,
      name: 'Sarah Jenkins',
      rating: 5.0,
      reviews: 42,
      distance: '1.5 miles away',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
  ];

  const handleExpertClick = (expert) => {
    setSelectedExpert(expert);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative h-[600px] rounded-[32px] overflow-hidden border border-slate-200 shadow-sm">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-slate-100">
          <img
            src="https://picsum.photos/seed/chicago-map/1600/1200"
            alt="Map"
            className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
            referrerPolicy="no-referrer"
          />
          
          {/* Map Overlays */}
          <div className="absolute top-6 left-6 flex flex-col gap-3">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center gap-3 border border-slate-100 w-80">
              <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                <div className="w-5 h-1 bg-slate-400 mb-1 rounded-full"></div>
                <div className="w-5 h-1 bg-slate-400 mb-1 rounded-full"></div>
                <div className="w-5 h-1 bg-slate-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">238 Market St, San Francisco, CA</p>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <Search className="w-4 h-4 text-slate-400" />
                <Navigation className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            
            <button className="bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 border border-slate-100 w-fit text-xs font-bold text-slate-600">
              <Layers className="w-4 h-4" />
              Layers
            </button>
          </div>

          {/* Fixer Markers on Map */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="relative">
                {/* User Location */}
                <div className="absolute top-20 left-20">
                  <div className="w-4 h-4 bg-violet-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100 text-[10px] font-bold">Your Location</div>
                </div>

                {/* Fixer 1 */}
                <div className="absolute -top-10 -left-20 group cursor-pointer" onClick={() => handleExpertClick(fixers[1])}>
                  <div className="w-10 h-10 bg-violet-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 fill-white" />
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-violet-600 text-white px-2 py-1 rounded-md shadow-lg text-[8px] font-bold uppercase tracking-wider">Fixer is 8 mins away</div>
                </div>
             </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
              <button className="p-3 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-3 hover:bg-slate-50 flex items-center justify-center">
                <Minus className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <button className="bg-white rounded-xl shadow-lg p-3 border border-slate-100 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Nearby Fixers List Overlay */}
          <div className="absolute top-6 right-6 w-80 bg-white/90 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Nearby Fixers</h3>
              <span className="px-2 py-1 bg-violet-100 text-violet-600 text-[10px] font-bold rounded-full">3 Online</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {fixers.map((fixer) => (
                <button
                  key={fixer.id}
                  onClick={() => handleExpertClick(fixer)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-all group text-left"
                >
                  <img
                    src={fixer.image}
                    alt={fixer.name}
                    className="w-12 h-12 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-violet-600 transition-colors">{fixer.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                        <span className="text-[10px] font-bold text-slate-700">{fixer.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">({fixer.reviews} reviews)</span>
                    </div>
                    <p className="text-[10px] text-violet-500 font-medium mt-1">{fixer.distance}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Guarantee Banner */}
      <div className="bg-violet-50 border border-violet-100 rounded-3xl p-6 flex items-start gap-4">
        <div className="p-3 bg-violet-100 rounded-xl text-violet-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-1">Professional Guarantee</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            All our fixers are certified and background checked. We provide a 30-day warranty on all service labor.
          </p>
        </div>
      </div>

      <ExpertProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expert={selectedExpert}
        onBook={() => {
          setIsModalOpen(false);
          onBook();
        }}
      />
    </div>
  );
};

export default FindFixer;
