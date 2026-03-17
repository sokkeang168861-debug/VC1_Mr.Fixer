import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-y-auto text-slate-900">
        <main className="p-8 md:p-12 flex flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
