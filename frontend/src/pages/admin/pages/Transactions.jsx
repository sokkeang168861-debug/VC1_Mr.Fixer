import React from 'react';
import Sidebar from '../components/Sidebar';
import FixerTransactions from '../components/FixerTransactions';

export default function Transactions() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto text-slate-900">
        <main className="p-8 md:p-12 flex flex-col gap-6">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Transaction Ledger</h1>
                  <p className="text-sm text-slate-500">View transactions across the platform and export a report.</p>
                </div>
              </div>
            </div>

            <FixerTransactions />
          </div>
        </main>
      </div>
    </div>
  );
}
