import React from 'react';
import { 
  Wrench, 
  MapPin, 
  Banknote,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const jobs = [
  {
    id: '#JOB-8842',
    postedAt: '5 mins ago',
    distance: '1.2 km away',
    customerName: 'Michael Richardson',
    category: 'Plumbing Repair',
    earnings: '$85.00',
    description: 'Kitchen sink is leaking significantly from the main pipe underneath. Water is pooling in the cabinet. Need urgent assistance.'
  },
  {
    id: '#JOB-8843',
    postedAt: '12 mins ago',
    distance: '2.5 km away',
    customerName: 'Sarah Jenkins',
    category: 'Electrical Work',
    earnings: '$120.00',
    description: 'Multiple power outlets in the living room have stopped working. No tripped breakers found in the panel.'
  }
];

const JobCard = ({ job }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow mb-4"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-3 items-center">
        <span className="text-[#FF7A00] font-bold text-sm">{job.id}</span>
        <span className="text-gray-400 text-sm">• Posted {job.postedAt}</span>
      </div>
      <div className="bg-[#FFF5EB] text-[#FF7A00] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
        <MapPin size={12} />
        {job.distance}
      </div>
    </div>

    <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">{job.customerName}</h3>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
          <Wrench size={18} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Category</p>
          <p className="text-sm font-semibold text-[#1A1A1A]">{job.category}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
          <Banknote size={18} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Est. Earnings</p>
          <p className="text-sm font-semibold text-[#22C55E]">{job.earnings}</p>
        </div>
      </div>
    </div>

    <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Issue Description</p>
      <p className="text-sm text-[#4A4A4A] leading-relaxed">
        {job.description}
      </p>
    </div>

    <Link 
      to={`/dashboard/fixer/jobs/${job.id.replace('#', '')}`}
      className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white text-center block font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200"
    >
      View Detail
    </Link>
  </motion.div>
);

export default function JobsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name="John Fixer" />

        <main className="flex-1 p-8 overflow-y-auto bg-[#f4f5f7]">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-[#1A1A1A] mb-1">Job Acceptance</h1>
                <p className="text-gray-400 font-medium">Manage incoming requests and active assignments</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 self-start sm:self-center">
                <span className="text-sm font-bold text-[#FF7A00]">New Requests</span>
                <span className="bg-[#FF7A00] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">4</span>
              </div>
            </div>

            <div className="space-y-6">
              {jobs.map((job, idx) => (
                <JobCard key={idx} job={job} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

