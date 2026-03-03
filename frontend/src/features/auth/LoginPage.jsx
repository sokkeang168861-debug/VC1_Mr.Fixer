import { motion as Motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, CheckCircle2 } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Left Column: Image & Branding */}
      <div className="hidden lg:flex flex-1 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-violet-900 opacity-90" />
        <img 
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200" 
          alt="Fixer professional" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-20 text-white">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-6xl font-display font-bold leading-tight">
              Quality Service, <br />
              Guaranteed.
            </h2>
            <p className="text-xl text-white/80 leading-relaxed max-w-md">
              Join thousands of homeowners who trust Mr. Fixer for their daily repair and maintenance needs. Expert hands, just a click away.
            </p>
            
            <div className="pt-12">
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-medium">Trusted by 50k+ Happy Customers</p>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <Motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-4xl font-display font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500">Enter your details information to login into the app</p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username or Email</label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="e.g. alex@example.com"
                  className="w-full pl-6 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
                <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-slate-600 group-hover:text-primary transition-colors">Remember me</span>
              </label>
              <a href="#" className="font-bold text-primary hover:underline">Forgot Password?</a>
            </div>

            <button className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]">
              Log In
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">OR</span>
              </div>
            </div>

            <button type="button" className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>
          </form>

          <p className="text-center text-slate-500">
            Don't have an account? <Link to="/signup" className="font-bold text-primary hover:underline">Sign Up for free</Link>
          </p>
        </Motion.div>
      </div>
    </div>
  );
}

