import React, { useState } from 'react';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'motion/react';

const FixerDetail = ({ fixer, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('all');

  const ratings = [
    { label: 'Quality of Work', score: 4.8 },
    { label: 'Speed of Service', score: 4.2 },
    { label: 'Price Fairness', score: 4.5 },
    { label: 'Professional Behavior', score: 4.9 },
  ];

  const reviews = [
    {
      id: 1,
      name: 'Sarah Williams',
      date: '2 days ago',
      rating: 5,
      comment: 'Marcus was incredibly professional. He fixed the leak in my kitchen quickly and even checked my other pipes for potential issues. Highly recommend!',
      initials: 'SW'
    },
    {
      id: 2,
      name: 'James Lee',
      date: 'Oct 12, 2023',
      rating: 5,
      comment: 'Excellent electrical work on our renovation. Very knowledgeable.',
      initials: 'JL'
    }
  ];

  const transactions = [
    { date: 'Oct 24, 2023', jobId: 'JB-1024', totalPaid: 450.0, commission: 67.5, netPayout: 382.5 },
    { date: 'Oct 25, 2023', jobId: 'JB-1025', totalPaid: 1200.0, commission: 120.0, netPayout: 1080.0 },
  ];

  const summaryData = [
    { date: 'Oct 24, 2023', jobId: 'JB-1024', totalPaid: 450.0, commission: 67.5, netPayout: 382.5 },
    { date: 'Oct 25, 2023', jobId: 'JB-1025', totalPaid: 1200.0, commission: 120.0, netPayout: 1080.0 },
  ];

  return (
    <Motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                src={fixer.avatar} 
                alt={fixer.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{fixer.name}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mt-1">
                <span>ID: {fixer.fixerId}</span>
                <span>•</span>
                <span>Plumber & Electrical Expert</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-orange-400 text-orange-400" />
                  <span className="text-sm font-bold text-slate-700">{fixer.rating} Rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{fixer.jobs} Jobs</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Detailed Ratings */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="font-bold text-lg">Detailed Ratings</h3>
          </div>
          <div className="p-8 space-y-8">
            {ratings.map((r) => (
              <div key={r.label} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{r.label}</span>
                  <span className="text-sm font-bold text-slate-800">{r.score} / 5.0</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <Motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.score / 5) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg">Reviews</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">42 Total</span>
          </div>
          <div className="p-8 flex-1 space-y-8">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {review.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{review.name}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className="fill-orange-400 text-orange-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{review.date}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Transaction</h2>
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="px-8 pt-8 border-b border-slate-50">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab('all')}
                className={`pb-4 text-sm font-bold transition-all ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                All Transactions
              </button>
              {/* <button 
                onClick={() => setActiveTab('summary')}
                className={`pb-4 text-sm font-bold transition-all ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Summarize
              </button> */}
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Job ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Total Paid</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Commission</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Net Payout</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {(activeTab === 'all' ? transactions : summaryData).map((t, i) => (
                  <Motion.tr 
                    key={`${activeTab}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-8 py-8 text-center text-sm font-bold text-slate-800">{t.date}</td>
                    <td className="px-8 py-8 text-center text-sm font-bold text-slate-800">{t.jobId}</td>
                    <td className="px-8 py-8 text-center text-sm font-bold text-slate-800">${t.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-8 text-center text-sm font-bold text-blue-500">${t.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-8 text-center text-sm font-bold text-emerald-500">${t.netPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </Motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </Motion.div>
  );
};

export default FixerDetail;
