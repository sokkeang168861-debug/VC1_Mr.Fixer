import React from 'react';
import { 
  ArrowLeft, 
  Wrench, 
  MapPin, 
  Zap,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const photos = [
    "https://picsum.photos/seed/house/400/400",
    "https://picsum.photos/seed/faucet/400/400",
    "https://picsum.photos/seed/pipe/400/400"
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name="John Fixer" />

        <main className="flex-1 p-8 overflow-y-auto bg-[#f4f5f7]">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-black text-[#1A1A1A]">Job Details {id}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Job Info Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="p-3 bg-[#FFF5EB] text-[#FF7A00] rounded-xl">
                        <Wrench size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#1A1A1A]">Plumbing Issue</h2>
                        <p className="text-sm text-gray-400 font-medium">Request ID: {id || "#FIX-99201"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Requested On</p>
                      <p className="text-sm font-bold text-[#1A1A1A]">Oct 24, 2023 • 10:30 AM</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">What's the problem?</p>
                      <div className="bg-[#F8F9FA] rounded-xl p-6">
                        <p className="text-sm text-[#4A4A4A] leading-relaxed">
                          My kitchen sink is leaking from the base and the wood underneath is damp. It seems to happen only when the faucet is running. There might be a crack in the main pipe or just a loose connection. I need this fixed as soon as possible before it damages the floor.
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">Attached Photos (3)</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {photos.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                            <img 
                              src={src} 
                              alt={`Job photo ${i + 1}`} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            {i === 2 && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                                <XCircle size={14} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link 
                    to={`/dashboard/fixer/jobs/${id}/proposal`}
                    className="flex-1 max-w-[240px] bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Accept Job
                  </Link>
                  <button className="text-red-500 font-bold hover:text-red-600 px-8 py-4 transition-colors">
                    Reject
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-6">
                {/* Urgency Level */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">Urgency Level</p>
                  <div className="bg-[#FFF9F0] border border-[#FFE8CC] rounded-xl p-4 flex gap-4">
                    <div className="w-12 h-12 bg-[#FF7A00] rounded-full flex items-center justify-center text-white shrink-0">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#FF7A00]">Urgent</h3>
                      <p className="text-xs text-[#8B5E3C] leading-tight mt-1">Needs attention within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-100 relative">
                    <img 
                      src="https://picsum.photos/seed/map/600/400?grayscale" 
                      className="w-full h-full object-cover opacity-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#FF7A00] rounded-full border-4 border-white shadow-xl animate-pulse flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">Service Location</p>
                    <div className="flex gap-3">
                      <div className="text-[#FF7A00] shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A1A1A]">842 Maplewood Avenue</h3>
                        <p className="text-xs text-gray-400 mt-1">Suite 4B, Brooklyn, NY 11211</p>
                        <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-gray-400">
                          <TrendingUpIcon size={12} className="rotate-45" />
                          2.4 miles away from your current location
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Helper for the distance icon
const TrendingUpIcon = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default JobDetails;