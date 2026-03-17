import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BriefcaseBusiness, TrendingUp, Bell, Settings, Wrench, LogOut  } from "lucide-react";
import httpClient from '../../../api/httpClient';

// import React, { useState, useEffect } from 'react';

export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    { name: "Home", icon: Home, path: "/dashboard/fixer" },
    { name: "Jobs", icon: BriefcaseBusiness, path: "/dashboard/fixer/jobs" },
    // { name: "Profit", icon: TrendingUp, path: "/dashboard/fixer/profit" },
    // { name: "Notification", icon: Bell, path: "/dashboard/fixer/notifications" },
    { name: "Settings", icon: Settings, path: "/dashboard/fixer/settings" },
  ];

  return (
    <aside className={`w-64 bg-white h-full flex flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Mr. FIXER</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path === "/dashboard/fixer" 
            ? location.pathname === "/dashboard/fixer"
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={`${item.name}-${index}`}
              to={item.path}
              className={`flex items-center px-6 py-3 text-lg transition-colors ${
                isActive
                  ? "bg-orange-100 text-orange-600 font-semibold border-r-4 border-orange-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-orange-500" : "text-gray-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
