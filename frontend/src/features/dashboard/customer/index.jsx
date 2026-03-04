import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import React, { useState } from 'react';
import { Sidebar, Header } from "./CustomerNavbar";
import { ArrowLeft, Star, MapPin, Phone, Mail, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data ---

const SERVICES = [
  { id: '1', title: 'Cars Repair', price: '$25+', description: 'Expert engine diagnostics, battery replacement, and roadside assistance.', prosCount: 15, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800' },
  { id: '2', title: 'Motorbikes Repair', price: '$15+', description: 'Fixing leaks, toilet repairs, and complete pipe installations for homes.', prosCount: 8, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800' },
  { id: '3', title: 'Electrical', price: '$20+', description: 'Safe electrical wiring, lighting installation, and appliance repair services.', prosCount: 12, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800' },
  { id: '4', title: 'Home Cleaning', price: '$10+', description: 'Deep cleaning, regular maintenance, and office sanitization services.', prosCount: 24, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800' },
  { id: '5', title: 'AC Services', price: '$18+', description: 'Gas refill, filter cleaning, and complete AC unit maintenance.', prosCount: 9, image: 'https://images.unsplash.com/photo-1621905252507-b354bcadcabc?auto=format&fit=crop&q=80&w=800' },
  { id: '6', title: 'Bicycle Repair', price: '$12+', description: 'Lawn mowing, plant care, and garden design for beautiful landscapes.', prosCount: 5, image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&q=80&w=800' },
];

const SPECIALISTS = [
  { id: '1', name: 'Marcus Chen', rating: 4.9, business: "Chen's Performance Auto", specialty: 'Engine Diagnostics, Brake Repair', price: '$25/hr', location: 'Phnom Penh, 5km', phone: '+855 12 345 678', email: 'marcus.chen@example.com', experience: '8+ Years', status: 'available', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
  { id: '2', name: 'Sarah Miller', rating: 4.7, business: 'Millers Brake & Tune', specialty: 'Brake Replacement, Oil Changes', price: '$20/hr', location: 'Siem Reap, 10km', phone: '+855 92 111 222', email: 'sarah.m@autocare.com', experience: '5+ Years', status: 'next-slot', slotTime: '2 PM', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
  { id: '3', name: 'David Soth', rating: 5.0, business: 'Expert Auto Care', specialty: 'Hybrid Repair, Diagnostic Scans', price: '$30/hr', location: 'Phnom Penh, 8km', phone: '+855 81 888 999', email: 'david.expert@soth.com', experience: '12+ Years', status: 'available', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
];

// --- Cards ---

const ServiceCard = ({ service, onViewFixers }) => (
  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="relative h-48 overflow-hidden">
      <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">{service.prosCount} PROS NEARBY</span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
        <span className="text-primary font-bold">{service.price}</span>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">{service.description}</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onViewFixers} className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200">VIEW FIXERS</button>
        <button className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200">USE SERVICE</button>
      </div>
    </div>
  </motion.div>
);

const SpecialistCard = ({ specialist }) => (
  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
    <div className="relative h-56 overflow-hidden">
      <img src={specialist.image} alt={specialist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md ${specialist.status === 'available' ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/90 text-white'}`}>
        <div className={`w-2 h-2 rounded-full ${specialist.status === 'available' ? 'bg-white animate-pulse' : 'bg-orange-400'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{specialist.status === 'available' ? 'AVAILABLE NOW' : `NEXT SLOT: ${specialist.slotTime}`}</span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xl font-bold text-slate-900">{specialist.name}</h3>
        <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg"><Star size={14} fill="currentColor" /><span className="text-sm font-bold">{specialist.rating}</span></div>
      </div>
      <p className="text-sm font-semibold text-primary mb-4">{specialist.business}</p>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2.5 text-slate-600"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /><span className="text-xs font-medium">{specialist.specialty}</span></div>
        <div className="flex items-center gap-2.5 text-slate-600"><Clock size={16} className="text-slate-400 shrink-0" /><span className="text-xs font-medium">{specialist.price}</span></div>
        <div className="flex items-center gap-2.5 text-slate-600"><MapPin size={16} className="text-slate-400 shrink-0" /><span className="text-xs font-medium">{specialist.location}</span></div>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-3 text-slate-500"><Phone size={14} /><span className="text-xs font-medium">{specialist.phone}</span></div>
        <div className="flex items-center gap-3 text-slate-500"><Mail size={14} /><span className="text-xs font-medium truncate">{specialist.email}</span></div>
        <div className="flex items-center gap-3 text-slate-500"><Calendar size={14} /><span className="text-xs font-medium">{specialist.experience}</span></div>
      </div>
    </div>
  </motion.div>
);

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('services');

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (httpClient && httpClient.defaults && httpClient.defaults.headers) {
      delete httpClient.defaults.headers.common?.["Authorization"];
    }
    navigate("/");
  };

  const renderPage = () => {
    if (currentPage === 'specialists') {
      return (
        <motion.div key="specialists" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-6 mb-8">
            <button onClick={() => setCurrentPage('services')} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Car Repair Specialists Near You</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2"><MapPin size={16} />Showing top-rated mechanics in your area</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SPECIALISTS.map((specialist) => (<SpecialistCard key={specialist.id} specialist={specialist} />))}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div key="services" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
        <div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 mb-2">Provincial Services Directory</h1><p className="text-slate-500 font-medium">Showing experts in Cambodia's major cities.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{SERVICES.map((service) => (<ServiceCard key={service.id} service={service} onViewFixers={() => setCurrentPage('specialists')} />))}</div>
      </motion.div>
    );
  };

  const sidebarTab = currentPage === 'specialists' ? 'services' : currentPage;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={sidebarTab} onChange={(tab) => { if (tab === 'services' || tab === 'specialists') setCurrentPage(tab); }} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col">
        <Header />

        <div className="p-8">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
}


