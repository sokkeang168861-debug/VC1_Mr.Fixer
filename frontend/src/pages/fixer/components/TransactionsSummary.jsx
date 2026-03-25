import { useState } from 'react';
import TransactionList from '@/pages/fixer/components/TransactionList';

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default function TransactionsSummary({
  transactions = [],
  monthlySummary = [],
  loading = false,
}) {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`border-b-2 px-6 py-3 text-sm font-medium transition ${
              activeTab === 'all'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Job
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`border-b-2 px-6 py-3 text-sm font-medium transition ${
              activeTab === 'summary'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'all' && (
          <TransactionList transactions={transactions} loading={loading} />
        )}

        {activeTab === 'summary' && (
          <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-gray-50 px-4 py-3">
              <div className="grid grid-cols-5 text-xs font-semibold uppercase text-gray-500">
                <div>Year</div>
                <div>Month</div>
                <div>Total Paid</div>
                <div>Commission</div>
                <div>Net Payout</div>
              </div>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="px-4 py-8 text-sm text-gray-500">
                  Loading summary...
                </div>
              ) : monthlySummary.length > 0 ? (
                monthlySummary.map((row) => (
                  <div
                    key={`${row.year}-${row.month}`}
                    className="grid grid-cols-5 px-4 py-3 text-sm hover:bg-gray-50"
                  >
                    <div>{row.year}</div>
                    <div>{row.month}</div>
                    <div className="font-bold text-gray-900">
                      {currencyFormatter.format(Number(row.total_paid || 0))}
                    </div>
                    <div className="font-bold text-orange-600">
                      {currencyFormatter.format(Number(row.commission || 0))}
                    </div>
                    <div className="font-bold text-green-600">
                      {currencyFormatter.format(Number(row.net_payout || 0))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-sm text-gray-500">
                  No summary data available yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
