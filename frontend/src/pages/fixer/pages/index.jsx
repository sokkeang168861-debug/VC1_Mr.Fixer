import React from 'react';
import { 
  Wrench, 
  Home, 
  Briefcase, 
  TrendingUp, 
  Bell, 
  Settings, 
  Star, 
  Wallet, 
  Percent, 
  PiggyBank
} from 'lucide-react';
import { motion as Motion } from 'motion/react';
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// --- Components ---



const StatCard = ({ icon, label, value, badge, badgeColor, iconBg }) => (
  <Motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 min-w-[240px]"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${iconBg}`}>
        {icon && React.createElement(icon, { size: 22, className: "text-white" })}
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
        {badge}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-slate-400 text-xs font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </Motion.div>
);

const RatingBar = ({ label, score }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-900 font-bold">{score} / 5.0</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <Motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(score / 5) * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-blue-500 rounded-full"
      />
    </div>
  </div>
);

const ReviewItem = ({ name, date, comment, initials }) => (
  <div className="py-4 border-b border-slate-50 last:border-0">
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
          {initials}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{name}</h4>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="fill-orange-400 text-orange-400" />
            ))}
          </div>
        </div>
      </div>
      <span className="text-[10px] text-slate-400 font-medium">{date}</span>
    </div>
    <p className="text-xs text-slate-500 leading-relaxed pl-11">
      "{comment}"
    </p>
  </div>
);

// --- Main App ---

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name="John Fixer" />

        <main className="flex-1 p-8 overflow-y-auto bg-[#f4f5f7]">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={Briefcase} 
              label="Total Jobs" 
              value="1,284" 
              badge="All jobs" 
              badgeColor="bg-slate-100 text-slate-500"
              iconBg="bg-purple-400"
            />
            <StatCard 
              icon={Wallet} 
              label="Total Profit" 
              value="$45,280.00" 
              badge="+12.5%" 
              badgeColor="bg-emerald-50 text-emerald-600"
              iconBg="bg-orange-400"
            />
            <StatCard 
              icon={Percent} 
              label="Total Commission" 
              value="$6,792.00" 
              badge="Standard" 
              badgeColor="bg-blue-50 text-blue-600"
              iconBg="bg-blue-400"
            />
            <StatCard 
              icon={PiggyBank} 
              label="Net Profit" 
              value="$38,488.00" 
              badge="+8.2%" 
              badgeColor="bg-emerald-50 text-emerald-600"
              iconBg="bg-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Ratings */}
      <Motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
      >
              <h2 className="text-xl font-bold text-slate-800 mb-8">Detailed Ratings</h2>
              <div className="space-y-8">
                <RatingBar label="Quality of Work" score={4.8} />
                <RatingBar label="Speed of Service" score={4.2} />
                <RatingBar label="Price Fairness" score={4.5} />
                <RatingBar label="Professional Behavior" score={4.9} />
              </div>
      </Motion.div>

            {/* Ratings & Feedback */}
            <Motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-6">Ratings & Feedback</h2>
              
              <div className="text-center mb-8">
                <h3 className="text-6xl font-black text-slate-900 mb-2">4.8</h3>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={20} className="fill-orange-500 text-orange-500" />
                  ))}
                  <Star size={20} className="text-orange-500" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Total 84 Ratings</p>
              </div>

              <div className="space-y-2">
                <ReviewItem 
                  name="James Lee" 
                  date="Oct 12, 2023" 
                  initials="JL"
                  comment="Excellent electrical work on our renovation. Very knowledgeable." 
                />
                <ReviewItem 
                  name="Sarah Williams" 
                  date="2 days ago" 
                  initials="SW"
                  comment="Marcus was incredibly professional. Fixed the leak quickly!" 
                />
              </div>
            </Motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
