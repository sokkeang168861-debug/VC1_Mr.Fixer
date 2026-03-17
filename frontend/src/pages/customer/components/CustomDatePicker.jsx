import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

/**
 * Compact date dropdown that matches the "Last 30 Days" popover style
 * shown in the mock: quick presets on the left and a light calendar on the right.
 */
export default function CustomDatePicker({ onClose, onSelect }) {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(today);
  const [label, setLabel] = useState('Last 30 Days');

  const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(
    new Date(viewYear, viewMonth, 1),
  );

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const grid = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const applySelection = (date, displayLabel) => {
    setSelected(date);
    setLabel(displayLabel);
    if (onSelect) onSelect(date, displayLabel);
    if (onClose) onClose();
  };

  const quickRanges = [
    { title: 'Today', label: 'Today', offset: 0 },
    { title: 'Last 7 Days', label: 'Last 7 Days', offset: 6 },
    { title: 'Last 30 Days', label: 'Last 30 Days', offset: 29 },
    { title: 'This Month', label: 'This Month', offset: null },
  ];

  const changeMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isSameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 p-4">
      <div className="mt-16 flex w-[440px] flex-col gap-2 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-100">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-slate-800">Date Filter</p>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close date picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
          <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
            {quickRanges.map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  if (item.offset === null) {
                    const first = new Date(viewYear, viewMonth, 1);
                    applySelection(first, item.label);
                  } else {
                    const d = new Date(today);
                    d.setDate(d.getDate() - item.offset);
                    applySelection(d, item.label);
                  }
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-semibold text-slate-700 transition hover:bg-white hover:shadow-sm"
              >
                {item.title}
                {label === item.label && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 p-2">
            <div className="mb-2 flex items-center justify-between px-1">
              <button
                onClick={() => changeMonth(-1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-[13px] font-semibold text-slate-800">
                {monthName} {viewYear}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {grid.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;

                const dateObj = new Date(viewYear, viewMonth, day);
                const disabled = dateObj > today;
                const selectedDay = isSameDay(dateObj, selected);

                return (
                  <button
                    key={day}
                    disabled={disabled}
                    onClick={() => setSelected(dateObj)}
                    className={`aspect-square w-full rounded-md text-[12px] font-semibold transition ${
                      selectedDay
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-700 hover:bg-slate-100'
                    } ${disabled ? 'cursor-not-allowed opacity-30 hover:bg-transparent' : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <div>
            <div className="text-xs uppercase text-slate-500">Selected</div>
            <div className="font-semibold text-slate-900">{label}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={() => applySelection(selected, label)}
              className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700"
              type="button"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
