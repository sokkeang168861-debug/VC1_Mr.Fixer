import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Header } from "../components/Header";
import { Search, TrendingUp, Wallet, Percent, PiggyBank } from 'lucide-react';
import TransactionList from '@/components/TransactionList';

export default function ProfitPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState('2023');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2021', '2022', '2023', '2024'];

  const transactions = [
    {
      id: '#TXN-88291-BA',
      date: 'Oct 24, 2023',
      time: '14:22 PM',
      user: 'Sarah Jenkins',
      totalPaid: '$450.00',
      commission: '$67.50',
      commissionRate: '15% STANDARD',
      netPayout: '$382.50'
    },
    {
      id: '#TXN-88290-CB',
      date: 'Oct 24, 2023',
      time: '13:05 PM',
      user: 'David Chen',
      totalPaid: '$1,200.00',
      commission: '$120.00',
      commissionRate: '10% VOLUME TIER',
      netPayout: '$1,080.00'
    },
    {
      id: '#TXN-88289-ZX',
      date: 'Oct 23, 2023',
      time: '11:58 AM',
      user: 'Emma Watson',
      totalPaid: '$85.00',
      commission: '$12.75',
      commissionRate: '15% STANDARD',
      netPayout: '$72.25'
    },
    {
      id: '#TXN-88288-LY',
      date: 'Oct 23, 2023',
      time: '09:15 AM',
      user: 'Marcus T.',
      totalPaid: '$210.00',
      commission: '$31.50',
      commissionRate: '15% STANDARD',
      netPayout: '$178.50'
    }
  ];

  const summaryData = [
    { year: '2023', month: 'September', profit: '$14,200.00', commission: '$2,130.00', net: '$12,070.00' },
    { year: '2023', month: 'August', profit: '$12,800.00', commission: '$1,920.00', net: '$10,880.00' },
    { year: '2023', month: 'July', profit: '$15,600.00', commission: '$2,340.00', net: '$13,260.00' },
    { year: '2023', month: 'June', profit: '$11,400.00', commission: '$1,710.00', net: '$9,690.00' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)]" />
      
      <main className="ml-64 mt-16 p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Profit Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Profit</h3>
            <p className="text-2xl font-bold text-gray-900">$45,280.00</p>
          </div>

          {/* Total Commission Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                Standard
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Commission</h3>
            <p className="text-2xl font-bold text-gray-900">$6,792.00</p>
          </div>

          {/* Net Profit Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Net Profit</h3>
            <p className="text-2xl font-bold text-gray-900">$38,488.00</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Job ID or Client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Transaction
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'summary'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Summary
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6">
            {activeTab === 'all' ? (
              <TransactionList />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4 items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div>Year</div>
                    <div>Month</div>
                    <div>Profit</div>
                    <div>Commission</div>
                    <div>Net</div>
                  </div>
                </div>
                
                {/* Summary Items */}
                <div className="divide-y divide-gray-100">
                  {summaryData.map((row, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-5 gap-4 items-center text-sm">
                          {/* Year */}
                          <div className="text-gray-900">
                            {row.year}
                          </div>
                          
                          {/* Month */}
                          <div className="text-gray-900">
                            {row.month}
                          </div>
                          
                          {/* Profit */}
                          <div className="font-bold text-gray-900">
                            {row.profit}
                          </div>
                          
                          {/* Commission */}
                          <div className="font-bold text-orange-600">
                            {row.commission}
                          </div>
                          
                          {/* Net */}
                          <div className="font-bold text-green-600">
                            {row.net}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}