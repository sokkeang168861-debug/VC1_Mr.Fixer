import { motion } from 'motion/react';
import { Car, Bike, Zap, Droplets, Home, Star, MapPin, CheckCircle2, Clock } from 'lucide-react';

export default function Services() {
  const categories = [
    { icon: <Car size={24} />, title: 'Car Repair', desc: 'Expert engine checkups, oil changes, and roadside assistance for your vehicle.' },
    { icon: <Bike size={24} />, title: 'Motor Repair', desc: 'Reliable maintenance for scooters and motorbikes, keeping you moving safely.' },
    { icon: <Bike size={24} />, title: 'Bicycle Repair', desc: 'Professional tuning, tire changes, and brake repairs for all types of bikes.' },
    { icon: <Zap size={24} />, title: 'Electrical', desc: 'Fixing wiring issues, appliance installation, and electrical safety checks.' },
    { icon: <Droplets size={24} />, title: 'Plumbing', desc: 'Leak repairs, pipe installations, and bathroom renovation services.' },
    { icon: <Home size={24} />, title: 'Home Fixing', desc: 'General maintenance, painting, and carpentry for your home improvement.' }
  ];

  const fixers = [
    {
      name: 'Dara Sokha',
      role: 'Expert Mechanic',
      exp: '8 yrs exp.',
      rating: 4.9,
      jobs: '450+ Jobs',
      speed: 'Faster responder',
      city: 'Phnom Penh',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
      color: 'bg-primary'
    },
    {
      name: 'Srey Leak',
      role: 'Electrical Specialist',
      exp: '6 yrs exp.',
      rating: 4.8,
      jobs: '312+ Jobs',
      speed: '99% Satisfaction',
      city: 'Siem Reap',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      color: 'bg-primary'
    },
    {
      name: 'Chan Vantha',
      role: 'Home & Plumbing',
      exp: '10 yrs exp.',
      rating: 5.0,
      jobs: '670+ Jobs',
      speed: 'Local expert',
      city: 'Phnom Penh',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      color: 'bg-primary'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 mb-8"
          >
            <CheckCircle2 size={16} className="text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">The #1 Maintenance Marketplace in Cambodia</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-display text-slate-900 mb-8"
          >
            Trusted Home Services in <br />
            <span className="text-primary">Cambodia</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Find professional fixers for your home, car, and bikes. High-quality services delivered right to your doorstep in Phnom Penh and Siem Reap.
          </motion.p>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl font-display text-slate-900">Service Categories</h2>
            <div className="h-px bg-slate-100 flex-1 mx-8 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-3">{cat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Fixers */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display text-slate-900 mb-4">Top-Rated Fixers in Your Area</h2>
            <p className="text-slate-500">Our highest-rated professionals available right now in Cambodia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fixers.map((fixer, idx) => (
              <motion.div
                key={fixer.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group"
              >
                <div className="relative h-72 overflow-hidden">
                  <img src={fixer.image} alt={fixer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-primary flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={12} /> Verified Pro
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-primary px-3 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-lg shadow-primary/20">
                      {fixer.city}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900">{fixer.name}</h3>
                      <p className="text-slate-500 text-sm">{fixer.role} • {fixer.exp}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-amber-700">{fixer.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle2 size={14} />
                      <span className="text-xs">{fixer.jobs}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} />
                      <span className="text-xs">{fixer.speed}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
