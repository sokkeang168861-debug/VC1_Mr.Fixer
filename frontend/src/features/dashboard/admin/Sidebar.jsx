import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { LuLayoutDashboard } from "react-icons/lu";
import { GiHammerNails, GiBoxUnpacking, GiTakeMyMoney } from "react-icons/gi";
import { FaUsersCog } from "react-icons/fa";

// NavItem Component
const NavItem = ({ icon, children, to, end = false }) => (
  <NavLink 
    to={to}
    end={end}
    className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${
      isActive 
        ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-slate-900 font-semibold shadow-sm' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <span className="text-xl w-6 text-center">{icon}</span>
    <span className="text-sm font-medium">{children}</span>
  </NavLink>
);

// Sidebar Component
export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 p-6 shadow-lg flex flex-col overflow-y-auto">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
        <img
          src="https://i.pravatar.cc/100"
          alt="admin"
          className="w-12 h-12 rounded-lg object-cover ring-2 ring-blue-100"
        />
        <div className="flex flex-col">
          <div className="font-bold text-sm text-slate-900">Admin</div>
          <div className="text-xs text-gray-500">Administrator</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <NavItem icon={<LuLayoutDashboard />} to="/dashboard/admin" end>Dashboard</NavItem>
        <NavItem icon={<GiBoxUnpacking />} to="/dashboard/admin/service-categories">Service Categories</NavItem>
        {/* <NavItem icon={<GiHammerNails />} to="/dashboard/admin/fixers">Fixer Management</NavItem>
        <NavItem icon={<FaUsersCog />} to="/dashboard/admin/users">User Management</NavItem>
        <NavItem icon={<GiTakeMyMoney />} to="/dashboard/admin/transactions">Transactions</NavItem> */}
      </nav>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-auto rounded-lg bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-semibold hover:from-red-100 hover:to-red-200 transition-all shadow-sm hover:shadow-md border border-red-200"
      >
        <LogOut size={18} />
        <span>Log out</span>
      </button>
    </aside>
  );
}
