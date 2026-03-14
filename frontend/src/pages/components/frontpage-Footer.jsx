import { Wrench} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-md text-white">
                <Wrench size={18} />
              </div>
              <span className="text-xl font-display font-bold text-primary">Mr. Fixer</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              The leading on-demand service marketplace for repair experts in Cambodia. Quality guaranteed for every fix.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Service Cities</h4>
            <ul className="space-y-4">
              {['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang'].map((city) => (
                <li key={city}>
                  <a href="#" className="text-slate-600 hover:text-primary text-sm transition-colors">{city}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Services</h4>
            <ul className="space-y-4">
              {['Car & Motor Repair', 'Electrical Work', 'Plumbing Repairs', 'Home Renovation'].map((service) => (
                <li key={service}>
                  <a href="#" className="text-slate-600 hover:text-primary text-sm transition-colors">{service}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-primary text-sm transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
