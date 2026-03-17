import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, History, Settings, LogOut } from 'lucide-react';
import httpClient from '../../../api/httpClient';

export const Sidebar = ({
  activeTab,
  onChange,
  onLogout,
  sticky = true,
  scrollNav = false,
}) => {
  const menuItems = [
    { id: 'services', label: 'Services', icon: Wrench },
    // { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Some pages (like History) use an internal scroll container for the main content.
  // In those cases, the sidebar doesn't need to "stick" under the header, and using
  // `top-16` creates an unwanted gap. Allow opting out per page.
  // We still keep a fixed height (viewport - header) so "Logout" can stay at the bottom.
  const sidebarStickyClasses = sticky
    ? 'sticky top-16'
    : '';
  const sidebarHeightClasses = 'h-[calc(100vh-4rem)]';

  const navScrollClasses = scrollNav ? 'overflow-y-auto' : 'overflow-hidden';

  return (
    <div
      className={`w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col p-4 overflow-hidden ${sidebarHeightClasses} ${sidebarStickyClasses}`}
    >
      <nav className={`min-h-0 flex-1 space-y-1 pb-4 ${navScrollClasses}`}>
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
    </div>
  );
};

export const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient
      .get("/user/currentUser")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error(err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const renderUserInfo = () => {
    if (loading) return <p className="text-sm text-slate-500">Loading...</p>;
    if (!user) return <p className="text-sm text-slate-500">Not signed in</p>;

    return (
      <>
        <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
        <p className="text-xs text-slate-500 font-medium">{user.role}</p>
      </>
    );
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Wrench size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary">Mr. Fixer</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4 ml-8">
        <div className="text-right">{renderUserInfo()}</div>
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
};

// Optional wrapper if you want a default export
export default function CustomerNavbar() {
  return null;
}
