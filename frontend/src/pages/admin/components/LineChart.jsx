import React from 'react';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

export default function LineChart({ monthlyJobs, year }) {
  const labels = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
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
        ticks: { color: '#94a3b8', precision: 0, stepSize: suggestedMax <= 10 ? 1 : undefined },
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