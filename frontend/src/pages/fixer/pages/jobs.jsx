import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';

import { Header } from "../components/Header";


export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gray-100">

      <Header />

      <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)]" />

      <main className="ml-64 mt-16 p-8">
        {/* page content */}
        <Outlet />
      </main>

    </div>
  );
}
