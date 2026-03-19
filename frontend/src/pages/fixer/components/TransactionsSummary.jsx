import { useState } from 'react';
import TransactionList from '@/components/TransactionList';

export default function TransactionsSummary() {
  const [activeTab, setActiveTab] = useState('all');

  const summaryData = [
    { year: '2023', month: 'September', profit: '$14,200.00', commission: '$2,130.00', net: '$12,070.00' },
    { year: '2023', month: 'August', profit: '$12,800.00', commission: '$1,920.00', net: '$10,880.00' },
    { year: '2023', month: 'July', profit: '$15,600.00', commission: '$2,340.00', net: '$13,260.00' },
    { year: '2023', month: 'June', profit: '$11,400.00', commission: '$1,710.00', net: '$9,690.00' }
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100">

      {/* 🔘 Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'all'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Transaction
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'summary'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {/* 📊 Content */}
      <div className="p-6">

        {/* ✅ ALL TRANSACTIONS */}
        {activeTab === 'all' && (
          <TransactionList />
        )}

        {/* ✅ SUMMARY TABLE */}
        {activeTab === 'summary' && (
          <div className="overflow-hidden border rounded-lg">

            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="grid grid-cols-5 text-xs font-semibold text-gray-500 uppercase">
                <div>Year</div>
                <div>Month</div>
                <div>Profit</div>
                <div>Commission</div>
                <div>Net</div>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y">
              {summaryData.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 px-4 py-3 text-sm hover:bg-gray-50"
                >
                  <div>{row.year}</div>
                  <div>{row.month}</div>
                  <div className="font-bold text-gray-900">{row.profit}</div>
                  <div className="font-bold text-orange-600">{row.commission}</div>
                  <div className="font-bold text-green-600">{row.net}</div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}