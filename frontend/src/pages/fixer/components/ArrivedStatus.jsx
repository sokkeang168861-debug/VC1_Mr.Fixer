import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArrivedStatus() {
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (isStarted) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Top Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          {!isStarted ? (
            <h2 className="text-2xl font-bold text-gray-800">You have arrvied</h2>
          ) : (
            <div className="flex justify-between items-center px-12">
              <h2 className="text-2xl font-bold text-gray-800">Timer:</h2>
              <h2 className="text-2xl font-bold text-gray-800 font-mono">{formatTime(seconds)}</h2>
            </div>
          )}
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {!isStarted ? 'Ready to start?' : 'Are you finish?'}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Please complete the checklist below before starting the official repair timer.
            </p>
          </div>

          <button 
            onClick={() => {
              if (!isStarted) {
                setIsStarted(true);
              } else {
                navigate('/dashboard/fixer/jobs/create-invoice');
              }
            }}
            className="w-full max-w-sm bg-[#FF7A1F] hover:bg-[#E66D1C] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#FF7A1F]/20"
          >
            Yes
          </button>
        </div>
      </div>

      {/* Right Sidebar: Job Overview */}
      <div className="w-80 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          <h3 className="text-lg font-bold text-gray-800">Job Overview</h3>
          
          <div className="bg-[#FFF9F0] rounded-2xl p-6 border border-[#FFF5ED]">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Total Estimated Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">$124.50</span>
              <span className="text-[10px] font-bold text-gray-400">Est. Earnings</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Issue Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                "Kitchen sink is leaking significantly from the P-trap. Water has started pooling under the cabinets. Needs immediate attention."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Job ID</p>
                <p className="text-sm font-bold text-gray-800">#FIX-88421</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Category</p>
                <p className="text-sm font-bold text-gray-800">Plumbing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
