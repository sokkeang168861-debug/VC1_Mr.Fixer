import React, { useCallback, useEffect, useState } from 'react';
import { Search, Calendar, Wallet, Percent, PiggyBank } from 'lucide-react';
import httpClient from '@/api/httpClient';

const statusStyles = {
  complete: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatJobId(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'N/A';
  }

  return `#JOB-${String(numericValue).padStart(5, '0')}`;
}

function generateMonthOptions() {
  return [
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
}

function generateYearRange() {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear - 5; year <= currentYear + 2; year += 1) {
    years.push(year);
  }

  return years;
}

export default function FixerTransactions() {
  const [searchInput, setSearchInput] = useState('');
  const [monthInput, setMonthInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalJobs: 0,
    totalPaid: 0,
    totalCommission: 0,
    totalNetPayout: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthOptions = generateMonthOptions();
  const yearOptions = generateYearRange();

  const loadTransactions = useCallback(async (filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await httpClient.get('/admin/transactions', {
        params: filters,
      });
      const payload = response?.data?.data || {};

      setTransactions(
        Array.isArray(payload.transactions) ? payload.transactions : []
      );
      setSummary({
        totalJobs: Number(payload.summary?.totalJobs || 0),
        totalPaid: Number(payload.summary?.totalPaid || 0),
        totalCommission: Number(payload.summary?.totalCommission || 0),
        totalNetPayout: Number(payload.summary?.totalNetPayout || 0),
      });
    } catch (requestError) {
      console.error('Failed to load admin transactions:', requestError);
      setTransactions([]);
      setSummary({
        totalJobs: 0,
        totalPaid: 0,
        totalCommission: 0,
        totalNetPayout: 0,
      });
      setError(
        requestError?.response?.data?.message ||
          'Failed to load transaction data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions({
      search: '',
      month: '',
      year: '',
    });
  }, [loadTransactions]);

  const handleSearch = () => {
    loadTransactions({
      search: searchInput,
      month: monthInput,
      year: yearInput,
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Search For Fixer Transaction
        </h2>
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by fixer, user, job ID or transaction ID"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="relative">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              value={monthInput}
              onChange={(event) => setMonthInput(event.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">All Months</option>
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">All Years</option>
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Total Customer Payments
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? 'Loading...' : formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Commission
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? 'Loading...' : formatCurrency(summary.totalCommission)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Percent className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Fixer Net Profit
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? 'Loading...' : formatCurrency(summary.totalNetPayout)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <PiggyBank className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white"
              >
                All Jobs
              </button>
            </div>
            <div className="text-sm text-slate-500">
              Showing {summary.totalJobs} record{summary.totalJobs === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User & Fixer
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Total Paid
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Commission
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Net Payout
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : null}

              {!loading
                ? transactions.map((transaction) => (
                    <tr
                      key={transaction.booking_id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-5 font-semibold text-slate-800">
                        {formatJobId(transaction.booking_id)}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(transaction.paid_at || transaction.created_at)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">
                            {transaction.customer_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {transaction.fixer_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-semibold text-slate-800">
                        {formatCurrency(transaction.total_paid)}
                      </td>
                      <td className="px-6 py-5 text-right font-semibold text-blue-600">
                        {formatCurrency(transaction.commission)}
                      </td>
                      <td className="px-6 py-5 text-right font-semibold text-emerald-600">
                        {formatCurrency(transaction.net_payout)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[transaction.status] ||
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {transaction.status_label || transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                : null}

              {!loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                    No transactions found for the selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
