import { motion as Motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../../api/httpClient";
import { ROUTES } from "@/config/routes";
import { setToken } from "@/lib/auth";

const signupImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { data } = await httpClient.post("/auth/register", {
        full_name: fullName,
        phone,
        email,
        password,
      });

      // store the auth token returned by the backend
      if (data?.token) {
        setToken(data.token);
      }

      setSuccess("Registration successful! Redirecting to dashboard...");
      setTimeout(() => navigate(ROUTES.dashboardCustomer), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Left Column: Image & Branding */}
      <div className="hidden lg:flex flex-1 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-violet-900 opacity-90" />
        <img 
          src= {signupImage}
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
            <h1 className="text-4xl font-display font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500">Please enter your details to register with Mr. Fixer.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Fullname</label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="johndoe_fix"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  required
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <User size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
              <div className="relative group">
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  required
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  required
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
              <div className="relative group">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="********"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" required/>
              <span className="text-slate-500">By signing up, you agree to sign up into our app</span>
            </div>

            <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]">
              Sign Up
            </button>
          </form>

          <p className="text-center text-slate-500">
            Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Log In</Link>
          </p>
        </Motion.div>
      </div>
    </div>
  );
}



