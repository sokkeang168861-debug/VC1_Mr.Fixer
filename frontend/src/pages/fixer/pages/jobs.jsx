import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function JobsPage() {
  return (
    <div className="bg-gray-100 h-screen overflow-y-auto">
      <Header name="John Fixer" className="fixed top-0 left-0 w-full z-50" />

      <div className="flex h-full pt-20">
        <Sidebar className="w-64 h-full fixed left-0 bg-white shadow-md" />

        {/* Main content */}
        <main className="ml-64 p-8 bg-[#f4f5f7] h-screen w-full">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
