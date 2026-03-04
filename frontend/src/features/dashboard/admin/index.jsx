import React from 'react';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Sidebar from './Sidebar.jsx';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

// StatCard Component
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

// LineChart Component
function LineChart() {
  const labels = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const dataValues = [20, 40, 55, 60, 80, 75, 95, 85, 50, 70, 100, 85];

  const data = {
    labels,
    datasets: [
      {
        label: 'Jobs',
        data: dataValues,
        fill: true,
        tension: 0.35,
        borderColor: '#1e90ff',
        pointRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#1e90ff',
        pointBorderWidth: 3,
        pointHoverRadius: 8,
        backgroundColor: ctx => {
          const chart = ctx.chart;
          const {ctx: c, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(30,144,255,0.25)');
          gradient.addColorStop(1, 'rgba(30,144,255,0.02)');
          return gradient;
        }
      }
    ]
  };

  const options = {
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 12 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { display: false }, beginAtZero: true }
    },
    elements: { point: { radius: 5 } },
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false }
  };

  return (
    <div className="bg-white rounded-2xl p-6 mt-2 shadow-lg">
      <div className="font-semibold text-slate-900 mb-4 text-lg">Job Volume Trends</div>
      <div style={{ height: '320px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold text-slate-900">Total Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Jobs" value="0" icon="📦" iconBg="#c7e9fd" />
        <StatCard title="Total Fixers" value="0" icon="🔧" iconBg="#f3e8ff" />
        <StatCard title="Total users" value="0" icon="💵" iconBg="#dcfce7" />
      </div>

      <LineChart />
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto">
        <main className="p-8 md:p-12">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
