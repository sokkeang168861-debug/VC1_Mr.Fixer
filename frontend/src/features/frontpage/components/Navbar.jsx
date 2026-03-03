import { Link, useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Services', path: '/services' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-lg text-white group-hover:scale-110 transition-transform">
              <Wrench size={24} />
            </div>
            <span className="text-2xl font-display font-bold text-primary">Mr. Fixer</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

