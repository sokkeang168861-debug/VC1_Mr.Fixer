import { motion as Motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Car, Droplets, Zap, ShieldCheck, Banknote, Clock, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const categories = [
    {
      icon: <Car className="text-primary" />,
      title: 'Car Repair',
      desc: 'Mobile mechanics for battery jumps, oil changes, and diagnostics at your doorstep.',
      bg: 'bg-violet-50'
    },
    {
      icon: <Droplets className="text-primary" />,
      title: 'Plumbing',
      desc: 'From clogged drains to new faucet installations, Leaking Faucets, our plumbers are ready to help.',
      bg: 'bg-violet-50'
    },
    {
      icon: <Zap className="text-primary" />,
      title: 'Electrical',
      desc: 'Certified electricians for wiring, light fixture installs, and power issues.',
      bg: 'bg-violet-50'
    }
  ];

  const features = [
    {
      icon: <ShieldCheck className="text-primary" size={32} />,
      title: 'Verified Expert',
      desc: 'Every expert undergoes a background check and skill verification process before joining our platform.'
    },
    {
      icon: <Banknote className="text-primary" size={32} />,
      title: 'Fair Pricing',
      desc: 'Transparent upfront pricing with no hidden fees. You know exactly what you\'ll pay before the work begins.'
    },
    {
      icon: <Clock className="text-primary" size={32} />,
      title: 'Fast Response',
      desc: 'Need it fixed now? Our experts respond within minutes and can often arrive the same day.'
    }
  ];

  const steps = [
    { id: '01', title: 'Choose issue', desc: 'Choose the issue that you face or set the issue.' },
    { id: '02', title: 'Fine fixer', desc: 'Fine the fixer and can choose which customer that you want.' },
    { id: '03', title: 'Confirm price', desc: 'Do the decision that you accept with that price or not.' },
    { id: '04', title: 'Fixer arrival', desc: 'When you confirm the price, the fixer will come and do it for you.' },
    { id: '05', title: 'Job completed', desc: 'Your fixer arrives, completes the job, and you rate your experience.' }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <Motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 space-y-8"
            >
              <h1 className="text-5xl lg:text-7xl font-display leading-[1.1] tracking-tight text-slate-900">
                Expert help for your needing, <span className="text-primary">just a click away.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Find your trusted fixers with Mr. Fixer. Every fairs and problems Mr. Fixer is near you. Comfortable journeys with comfortable fixers by exploring Mr. Fixer.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/signup" className="bg-primary text-white px-8 py-4 rounded-2xl font-semibold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95">
                  Get Started
                </Link>
              </div>
            </Motion.div>

            <Motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" 
                  alt="Fixer professional" 
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              
              {/* Floating Card */}
              <Motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trusted Experts</p>
                  <p className="text-xl font-display font-bold text-slate-900">10,000+ Services Fixed</p>
                </div>
              </Motion.div>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-display text-slate-900 mb-4">Popular Categories</h2>
            <p className="text-slate-500">Quickly find the most requested services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
                  <Motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`${cat.bg} p-10 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer`}
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{cat.title}</h3>
                <p className="text-slate-600 leading-relaxed">{cat.desc}</p>
                  </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-display text-slate-900 mb-6">Why Choose Mr. Fixer?</h2>
            <p className="text-slate-600 leading-relaxed">
              We take the stress out of home maintenance by connecting you with fixers professionals who care about your issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {features.map((feature, idx) => (
                  <Motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-primary/5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
                  </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-display text-slate-900 mb-6">How It Works</h2>
            <p className="text-slate-600 leading-relaxed">
              Get your repairs done in four simple steps. We make it easy to find, book, and pay for quality services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, idx) => (
              <Motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6 relative"
              >
                <div className="text-6xl font-display text-primary select-none">
                  {step.id}
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
