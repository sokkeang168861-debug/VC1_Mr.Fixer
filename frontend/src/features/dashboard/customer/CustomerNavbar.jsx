import React from 'react';
import { Wrench, Calendar, History, Settings, LogOut } from 'lucide-react';


export const Sidebar = ({ activeTab, onChange, onLogout }) => {
  const menuItems = [
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Wrench size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary">Mr. Fixer</span>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange && onChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
              ? 'bg-primary-light text-primary font-semibold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto px-4 pt-6">
        <button
          onClick={() => onLogout && onLogout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export const Header = () => (
  <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
    <div className="flex-1" />
    <div className="flex items-center gap-4 ml-8">
      <div className="text-right">
        <p className="text-sm font-bold text-slate-900">Alex Johnson</p>
        <p className="text-xs text-slate-500 font-medium">Premium Member</p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
          alt="Profile"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  </header>
);

export default function CustomerNavbar() {
  return null;
}
