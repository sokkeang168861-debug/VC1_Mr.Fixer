import React from 'react';

export default function StatCard({ title, value, icon, iconBg }) {
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