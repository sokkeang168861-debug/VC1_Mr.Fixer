import React, { useMemo, useState } from 'react';
import { Download, Search, Calendar } from 'lucide-react';

const sampleTransactions = [
  {
    id: 'TXN-88221-BA',
    date: 'Oct 24, 2023',
    month: 10,
    year: 2023,
    user: 'Sarah Jenkins',
    fixer: "Mike's Repairs",
    totalPaid: 450.0,
    commission: 67.5,
    netPayout: 382.5,
    status: 'completed',
  }
];

const statusStyles = {
  all: 'bg-slate-100 text-slate-700'
};

const statusLabels = {
  all: 'All Transactions'
};

function formatCurrency(value) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function generateYearRange() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
}

export default function FixerTransactions() {
  const [searchInput, setSearchInput] = useState('');
  const [monthInput, setMonthInput] = useState(new Date().getMonth() + 1);
  const [yearInput, setYearInput] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('all');

  const [appliedFilter, setAppliedFilter] = useState({
    search: '',
    month: monthInput,
    year: yearInput,
  });

  const transactions = useMemo(() => {
    const normalizedSearch = appliedFilter.search.trim().toLowerCase();

    return sampleTransactions.filter((txn) => {
      const matchesStatus = activeTab === 'all' ? true : txn.status === activeTab;
      const matchesSearch =
        !normalizedSearch ||
        txn.id.toLowerCase().includes(normalizedSearch) ||
        txn.user.toLowerCase().includes(normalizedSearch) ||
        txn.fixer.toLowerCase().includes(normalizedSearch) ||
        txn.date.toLowerCase().includes(normalizedSearch);
      const matchesDate = txn.month === appliedFilter.month && txn.year === appliedFilter.year;

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [activeTab, appliedFilter]);

  const totals = useMemo(() => {
    const totalVolume = transactions.reduce((acc, txn) => acc + txn.totalPaid, 0);
    const totalCommission = transactions.reduce((acc, txn) => acc + txn.commission, 0);
    const totalPayout = transactions.reduce((acc, txn) => acc + txn.netPayout, 0);
    return { totalVolume, totalCommission, totalPayout };
  }, [transactions]);

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const yearOptions = generateYearRange();

  const handleSearch = () => {
    setAppliedFilter({ search: searchInput, month: monthInput, year: yearInput });
  };

//   const handleExportCsv = () => {
//     const headers = ['Transaction ID', 'Date', 'User', 'Fixer', 'Total Paid', 'Commission', 'Net Payout', 'Status'];
//     const rows = transactions.map((txn) => [
//       txn.id,
//       txn.date,
//       txn.user,
//       txn.fixer,
//       txn.totalPaid.toFixed(2),
//       txn.commission.toFixed(2),
//       txn.netPayout.toFixed(2),
//       statusLabels[txn.status] || txn.status,
//     ]);

//     const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Search For Fixer transaction</h2>
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by user, fixer, ID or date"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={monthInput}
              onChange={(e) => setMonthInput(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={yearInput}
              onChange={(e) => setYearInput(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {yearOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Customer Payments</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totals.totalVolume)}</p>
            </div>
            <div className="text-2xl">💳</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Commission</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totals.totalCommission)}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Fixer Net Profit</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totals.totalPayout)}</p>
            </div>
            <div className="text-2xl">💼</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {Object.keys(statusLabels).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeTab === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {statusLabels[key]}
                </button>
              ))}
            </div>
            <div className="text-sm text-slate-500">
              Showing {transactions.length} record{transactions.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User & Fixer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Total Paid</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Commission</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Net Payout</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-slate-800">{txn.id}</td>
                  <td className="px-6 py-5 text-sm text-slate-500">{txn.date}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">{txn.user}</span>
                      <span className="text-xs text-slate-500">{txn.fixer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-semibold text-slate-800">{formatCurrency(txn.totalPaid)}</td>
                  <td className="px-6 py-5 text-right font-semibold text-blue-600">{formatCurrency(txn.commission)}</td>
                  <td className="px-6 py-5 text-right font-semibold text-emerald-600">{formatCurrency(txn.netPayout)}</td>
                  <td className="px-6 py-5 text-right">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                        statusStyles[txn.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {statusLabels[txn.status] || txn.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                    No transactions found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
