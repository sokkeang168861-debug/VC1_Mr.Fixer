import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Sidebar from './Sidebar.jsx';
import httpClient from '../../../api/httpClient';
import { FaPeopleLine, FaArrowsDownToPeople, FaUsers, FaPeopleCarryBox  } from "react-icons/fa6";
import { Outlet } from 'react-router-dom';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

function StatCard({ title, value, icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex justify-between items-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex flex-col gap-1">
        <div className="text-gray-600 text-sm font-medium">{title}</div>
        <div className="text-slate-900 text-2xl font-bold">{value || '-'}</div>
      </div>
      <div className="rounded-xl p-3 text-2xl" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
    </div>
  );
}

function LineChart({ monthlyJobs, year }) {
  const labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dataValues = Array.isArray(monthlyJobs) && monthlyJobs.length === 12
    ? monthlyJobs
    : new Array(12).fill(0);
  const maxValue = Math.max(...dataValues, 0);
  const suggestedMax = maxValue <= 5 ? 5 : Math.ceil(maxValue * 1.2);

  const data = {
    labels,
    datasets: [
      {
        label: `Jobs (${year})`,
        data: dataValues,
        fill: true,
        tension: 0.25,
        cubicInterpolationMode: 'monotone',
        borderColor: '#1e90ff',
        pointRadius: 4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#1e90ff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(30,144,255,0.25)');
          gradient.addColorStop(1, 'rgba(30,144,255,0.02)');
          return gradient;
        },
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 12 } } },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        beginAtZero: true,
        suggestedMax,
        ticks: {
          color: '#94a3b8',
          precision: 0,
          stepSize: suggestedMax <= 10 ? 1 : undefined,
        },
      },
    },
    elements: { point: { radius: 5 } },
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
  };

  return (
    <div className="bg-white rounded-2xl p-6 mt-2 shadow-lg">
      <div className="font-semibold text-slate-900 mb-4 text-lg">Job Volume Trends ({year})</div>
      <div style={{ height: '320px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalFixers: 0,
    totalCustomers: 0,
    totalUsers: 0,
    monthlyJobs: new Array(12).fill(0),
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      const currentYear = new Date().getFullYear();
      try {
        setError('');
        const res = await httpClient.get('/admin/stats', { params: { year: currentYear } });
        const apiData = res.data?.data || {};
        const apiMonthlyJobs = Array.isArray(apiData.monthlyJobs) ? apiData.monthlyJobs : [];
        const normalizedMonthlyJobs = new Array(12).fill(0).map((_, i) => Number(apiMonthlyJobs[i] || 0));

        setStats({
          totalJobs: Number(apiData.totalJobs || 0),
          totalFixers: Number(apiData.totalFixers || 0),
          totalCustomers: Number(apiData.totalCustomers || 0),
          totalUsers: Number(apiData.totalUsers || 0),
          monthlyJobs: normalizedMonthlyJobs,
          year: Number(apiData.year || currentYear),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold text-slate-900">Total Progress</h1>

      {error ? <p className="text-red-600 text-sm">{error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Jobs" value={loading ? '...' : stats.totalJobs} icon={<FaPeopleLine />} iconBg="#c7e9fd" />
        <StatCard title="Total Users" value={loading ? '...' : stats.totalUsers} icon={<FaUsers />} iconBg="#dcfce7" />
        <StatCard title="Total Fixers" value={loading ? '...' : stats.totalFixers} icon={<FaPeopleCarryBox />} iconBg="#f3e8ff" />
        <StatCard title="Total Customers" value={loading ? '...' : stats.totalCustomers} icon={<FaArrowsDownToPeople />} iconBg="#e0f2fe" />
      </div>

      <LineChart monthlyJobs={stats.monthlyJobs} year={stats.year} />
    </div>
  );
}

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto text-slate-900">
        <main className="p-8 md:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

AdminLayout.Dashboard = Dashboard;
