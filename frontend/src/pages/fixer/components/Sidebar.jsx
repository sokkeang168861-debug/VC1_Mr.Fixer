import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BriefcaseBusiness, TrendingUp, Bell, Settings, Wrench, LogOut  } from "lucide-react";
import httpClient from '../../../api/httpClient';

// import React, { useState, useEffect } from 'react';

export default function Sidebar() {
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
    // { name: "Settings", icon: Settings, path: "/dashboard/fixer/settings" },
  ];

  return (
    <aside className="w-64 bg-white h-full border-r border-gray-200">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-orange-500">Mr.FIXER</h1>
      </div>
      <nav className="mt-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={`${item.name}-${index}`}
              to={item.path}
              className={`flex items-center px-5 py-3 text-lg transition-colors rounded-xl mx-3 mb-1 ${isActive
                  ? "bg-orange-100 text-orange-600 font-semibold"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-orange-500" : "text-gray-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
