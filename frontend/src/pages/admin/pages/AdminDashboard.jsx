import React, { useEffect, useState } from 'react';
import { FaPeopleLine, FaArrowsDownToPeople, FaUsers, FaPeopleCarryBox } from "react-icons/fa6";
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import httpClient from '../../../api/httpClient';

export default function AdminDashboard() {
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
    <>
      <h1 className="text-4xl font-bold text-slate-900">Total User</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Jobs" value={loading ? '...' : stats.totalJobs} icon={<FaPeopleLine />} iconBg="#c7e9fd" />
        <StatCard title="Total Users" value={loading ? '...' : stats.totalUsers} icon={<FaUsers />} iconBg="#dcfce7" />
        <StatCard title="Total Fixers" value={loading ? '...' : stats.totalFixers} icon={<FaPeopleCarryBox />} iconBg="#f3e8ff" />
        <StatCard title="Total Customers" value={loading ? '...' : stats.totalCustomers} icon={<FaArrowsDownToPeople />} iconBg="#e0f2fe" />
      </div>

      <LineChart monthlyJobs={stats.monthlyJobs} year={stats.year} />
    </>
  );
}
