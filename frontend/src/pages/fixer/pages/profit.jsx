import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Header } from "../components/Header";
import SummaryCards from '../components/SummaryCards';
import SearchFilter from '../components/SearchFilter';
import TransactionsSummary from '../components/TransactionsSummary';

export default function ProfitPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState('2023');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)]" />
      
      <main className="ml-64 mt-16 p-8 space-y-8">
        <SummaryCards />
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
        <TransactionsSummary />
      </main>
    </div>
  );
}