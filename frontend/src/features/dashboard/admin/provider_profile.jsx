import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Mail,
  MapPin,
  Phone,
  Send,
  Star,
  UserCircle2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const CATEGORY_STYLES = {
  'Car repair': 'bg-amber-50 text-amber-600',
  'Motor repair': 'bg-orange-50 text-orange-600',
  'Bicycle repair': 'bg-lime-50 text-lime-700',
  'Electrical repair': 'bg-violet-50 text-violet-600',
  Plumbing: 'bg-blue-50 text-blue-600',
  'Home fixing': 'bg-emerald-50 text-emerald-600',
  Other: 'bg-slate-100 text-slate-600',
};

const INPUT_CLASS = 'h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
const TEXTAREA_CLASS = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none';

const MONTH_ORDER = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CUSTOMER_NAMES = [
  'Sarah Williams',
  'James Lee',
  'Emily Johnson',
  'Daniel Kim',
  'Olivia Brown',
  'Michael Davis',
  'Sophia Wilson',
  'Ethan Martinez',
  'Ava Taylor',
  'Noah Anderson',
  'Mia Thomas',
  'Lucas Jackson',
];

const SERVICE_OPTIONS = {
  'Car repair': ['Brake inspection', 'Engine tune-up', 'Battery replacement'],
  'Motor repair': ['Engine diagnostics', 'Oil change service', 'Brake pad replacement'],
  'Bicycle repair': ['Wheel alignment', 'Chain replacement', 'Brake cable adjustment'],
  'Electrical repair': ['Wiring repair', 'Breaker replacement', 'Socket installation'],
  Plumbing: ['Leak repair', 'Pipe replacement', 'Water pump service'],
  'Home fixing': ['Door repair', 'Shelf installation', 'Wall fixture service'],
  Other: ['General maintenance', 'On-site inspection', 'Repair service'],
};

const emptyContactForm = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
});

const getPrimaryCategory = (fixer) => fixer.categories?.[0] || 'Other';
const formatCategoryLabel = (category) => (category === 'Electrical repair' ? 'Electrical' : category);
const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));
const getInitials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FX';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const getMonthOrder = (month) => Math.max(0, MONTH_ORDER.indexOf(month));
const roundCurrency = (value) => Math.round(Number(value || 0) * 100) / 100;

const buildRatingBreakdown = (fixer) => {
  const baseRating = clampValue(Number(fixer.rating || 4.2), 3.5, 5);

  return [
    { label: 'Quality of Work', score: clampValue(baseRating + 0.1, 0, 5) },
    { label: 'Speed of Service', score: clampValue(baseRating - 0.3, 0, 5) },
    { label: 'Price Fairness', score: clampValue(baseRating - 0.05, 0, 5) },
    { label: 'Professional Behavior', score: clampValue(baseRating + 0.15, 0, 5) },
  ];
};

const buildAllReviews = (fixer) => {
  const firstName = String(fixer.fullName || 'This fixer').split(' ')[0];
  const expertise = formatCategoryLabel(getPrimaryCategory(fixer)).toLowerCase();

  return [
    {
      author: 'Sarah Williams',
      date: '2 days ago',
      rating: 5,
      message: `${firstName} was incredibly professional. The ${expertise} work was completed quickly and carefully, and the communication stayed clear throughout the visit.`,
    },
    {
      author: 'James Lee',
      date: 'Oct 12, 2023',
      rating: clampValue(Math.round(Number(fixer.rating || 4.5)), 4, 5),
      message: `Excellent service from ${firstName}. The repair was done neatly, with good attention to detail, and I would confidently book this fixer again.`,
    },
    {
      author: 'Olivia Brown',
      date: 'Sep 28, 2023',
      rating: 5,
      message: `${firstName} arrived on time, explained the ${expertise} issue clearly, and completed the work in a very professional way.`,
    },
    {
      author: 'Michael Davis',
      date: 'Aug 16, 2023',
      rating: clampValue(Math.round(Number(fixer.rating || 4.4)), 4, 5),
      message: `Very satisfied with ${firstName}'s service. The problem was fixed faster than expected and everything was left clean afterward.`,
    },
    {
      author: 'Sophia Wilson',
      date: 'Jul 04, 2023',
      rating: 5,
      message: `Great communication, fair pricing, and solid workmanship. I would definitely recommend ${firstName} for future ${expertise} jobs.`,
    },
  ];
};

const buildRecentReviews = (fixer) => buildAllReviews(fixer).slice(0, 2);

const sortTransactionSummary = (transactions) => [...transactions].sort((left, right) => {
  if (left.year !== right.year) return left.year - right.year;
  return getMonthOrder(left.month) - getMonthOrder(right.month);
});

const buildTransactionRows = (fixer) => {
  const jobs = Number(fixer.jobs || 0);
  const experience = Number(fixer.yearsOfExperience || 0);
  const rating = Number(fixer.rating || 4.5);
  const averageTicket = Math.max(70, 48 + (experience * 6) + (rating * 12));
  const workloadUnits = Math.max(1, Math.min(4, Math.round(jobs / 70) || 1));
  const serviceOptions = SERVICE_OPTIONS[getPrimaryCategory(fixer)] || SERVICE_OPTIONS.Other;
  const customerOffset = String(fixer.id || '')
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0) % CUSTOMER_NAMES.length;
  const transactionPlan = [
    { year: 2022, monthIndex: 2, day: 8, factor: 0.84 },
    { year: 2022, monthIndex: 9, day: 5, factor: 1.02 },
    { year: 2022, monthIndex: 9, day: 22, factor: 0.91 },
    { year: 2023, monthIndex: 1, day: 14, factor: 0.95 },
    { year: 2023, monthIndex: 5, day: 10, factor: 1.09 },
    { year: 2023, monthIndex: 9, day: 3, factor: 1.17 },
    { year: 2023, monthIndex: 9, day: 25, factor: 0.73 },
    { year: 2024, monthIndex: 3, day: 11, factor: 1.04 },
    { year: 2024, monthIndex: 7, day: 9, factor: 1.13 },
    { year: 2024, monthIndex: 7, day: 27, factor: 0.88 },
    { year: 2025, monthIndex: 0, day: 15, factor: 1.07 },
    { year: 2025, monthIndex: 11, day: 6, factor: 1.24 },
  ];

  return [...transactionPlan]
    .map((entry, index) => {
      const transactionDate = new Date(Date.UTC(entry.year, entry.monthIndex, entry.day));
      const totalPaid = roundCurrency(averageTicket * workloadUnits * entry.factor);
      const commission = roundCurrency(totalPaid * 0.15);
      const netPayout = roundCurrency(totalPaid - commission);

      return {
        id: `${fixer.id}-TX-${index + 1}`,
        customerName: CUSTOMER_NAMES[(customerOffset + index) % CUSTOMER_NAMES.length],
        service: serviceOptions[index % serviceOptions.length],
        date: transactionDate.toISOString(),
        dateLabel: new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(transactionDate),
        year: entry.year,
        month: MONTH_ORDER[entry.monthIndex],
        totalPaid,
        commission,
        netPayout,
      };
    })
    .sort((left, right) => new Date(right.date) - new Date(left.date));
};

const buildTransactionSummary = (transactions) => {
  const summaryMap = transactions.reduce((accumulator, transaction) => {
    const key = `${transaction.year}-${transaction.month}`;

    if (!accumulator[key]) {
      accumulator[key] = {
        year: transaction.year,
        month: transaction.month,
        jobs: 0,
        totalPaid: 0,
        commission: 0,
        netPayout: 0,
      };
    }

    accumulator[key].jobs += 1;
    accumulator[key].totalPaid += Number(transaction.totalPaid || 0);
    accumulator[key].commission += Number(transaction.commission || 0);
    accumulator[key].netPayout += Number(transaction.netPayout || 0);

    return accumulator;
  }, {});

  return sortTransactionSummary(Object.values(summaryMap).map((transaction) => ({
    ...transaction,
    totalPaid: roundCurrency(transaction.totalPaid),
    commission: roundCurrency(transaction.commission),
    netPayout: roundCurrency(transaction.netPayout),
  })));
};

export default function ProviderProfile({ fixer, onBack, onEdit }) {
  const [transactionView, setTransactionView] = useState('all');
  const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactForm, setContactForm] = useState(() => ({
    ...emptyContactForm(),
    email: fixer?.email || '',
    phone: fixer?.phone || '',
  }));

  useEffect(() => {
    setContactForm({
      ...emptyContactForm(),
      email: fixer?.email || '',
      phone: fixer?.phone || '',
    });
  }, [fixer]);

  const detailRatings = useMemo(() => (fixer ? buildRatingBreakdown(fixer) : []), [fixer]);
  const detailAllReviews = useMemo(() => (fixer ? buildAllReviews(fixer) : []), [fixer]);
  const detailReviews = useMemo(() => (fixer ? buildRecentReviews(fixer) : []), [fixer]);
  const detailTransactions = useMemo(() => (fixer ? buildTransactionRows(fixer) : []), [fixer]);
  const detailSummary = useMemo(() => buildTransactionSummary(detailTransactions), [detailTransactions]);

  if (!fixer) return null;

  const handleOpenContact = () => {
    setContactError('');
    setIsContactOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactOpen(false);
    setContactError('');
  };

  const handleSubmitContact = (event) => {
    event.preventDefault();

    if (!contactForm.firstName.trim() || !contactForm.lastName.trim() || !contactForm.email.trim() || !contactForm.phone.trim() || !contactForm.message.trim()) {
      setContactError('Please complete all contact fields before sending your message.');
      return;
    }

    window.alert('Message sent successfully.');
    handleCloseContact();
  };

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        <span>Back to Fixers</span>
      </button>

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-6 border-b border-slate-100 px-8 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-blue-50">
                {fixer.imageUrl ? (
                  <img src={fixer.imageUrl} alt={fixer.fullName} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="text-slate-300" size={48} />
                )}
              </div>
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
            </div>

            <div className="space-y-3">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">{fixer.fullName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span>ID: {fixer.id}</span>
                  <span className="text-slate-300">•</span>
                  <span>{formatCategoryLabel(getPrimaryCategory(fixer))} Expert</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                <div className="inline-flex items-center gap-1.5 font-semibold text-amber-500">
                  <Star size={15} fill="currentColor" />
                  <span>{fixer.rating ? fixer.rating.toFixed(1) : '—'} Rating</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness size={16} className="text-slate-400" />
                  <span>{fixer.jobs || 0} Jobs</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{fixer.location || 'Location unavailable'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Phone size={16} className="text-slate-400" />
                  <span>{fixer.phone || 'No phone number'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(fixer)}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={handleOpenContact}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1D80E7] px-5 text-sm font-bold text-white transition-all hover:bg-blue-600"
            >
              <Mail size={16} />
              <span>Contact Fixer</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-8 xl:grid-cols-[minmax(0,1.15fr),360px]">
          <section className="rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-2xl font-bold text-slate-900">Detailed Ratings</h2>
            </div>

            <div className="space-y-6 px-6 py-6">
              {detailRatings.map((item) => (
                <div key={item.label} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.score.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[#1D80E7]" style={{ width: `${(item.score / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-2xl font-bold text-slate-900">Recent Reviews</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{detailAllReviews.length} Total</span>
            </div>

            <div className="space-y-6 px-6 py-6">
              {detailReviews.map((review) => (
                <div key={`${review.author}-${review.date}`} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                    {getInitials(review.author)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{review.author}</p>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={`${review.author}-${index}`} size={13} fill={index < review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">{review.date}</span>
                    </div>

                    <p className="text-sm leading-7 text-slate-400">“{review.message}”</p>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setIsAllReviewsOpen(true)}
                className="block w-full pt-2 text-center text-sm font-bold text-slate-600 transition-colors hover:text-blue-500"
              >
                View All Reviews
              </button>
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Transaction</h2>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-8 border-b border-slate-100 px-8 pt-6">
            <button
              type="button"
              onClick={() => setTransactionView('all')}
              className={`border-b-2 pb-4 text-sm font-bold transition-colors ${transactionView === 'all' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              All Transactions
            </button>
            <button
              type="button"
              onClick={() => setTransactionView('summary')}
              className={`border-b-2 pb-4 text-sm font-bold transition-colors ${transactionView === 'summary' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Summarize
            </button>
          </div>

          <div className="p-8">
            {transactionView === 'all' ? (
              <div className="max-h-[360px] overflow-auto">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Service</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Paid</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Commission</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-5 font-bold text-slate-900">{transaction.customerName}</td>
                        <td className="px-6 py-5 font-semibold text-slate-700">{transaction.service}</td>
                        <td className="px-6 py-5 text-sm font-semibold text-slate-500">{transaction.dateLabel}</td>
                        <td className="px-6 py-5 font-bold text-slate-900">{formatCurrency(transaction.totalPaid)}</td>
                        <td className="px-6 py-5 font-bold text-blue-500">{formatCurrency(transaction.commission)}</td>
                        <td className="px-6 py-5 font-bold text-emerald-500">{formatCurrency(transaction.netPayout)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-auto">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Year</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Month</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Jobs</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Paid</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Commission</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailSummary.map((transaction) => (
                      <tr key={`summary-${transaction.year}-${transaction.month}`}>
                        <td className="px-6 py-5 font-bold text-slate-900">{transaction.year}</td>
                        <td className="px-6 py-5 font-semibold text-slate-700">{transaction.month}</td>
                        <td className="px-6 py-5 font-bold text-slate-900">{transaction.jobs}</td>
                        <td className="px-6 py-5 font-bold text-slate-900">{formatCurrency(transaction.totalPaid)}</td>
                        <td className="px-6 py-5 font-bold text-blue-500">{formatCurrency(transaction.commission)}</td>
                        <td className="px-6 py-5 font-bold text-emerald-500">{formatCurrency(transaction.netPayout)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isAllReviewsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex max-h-[82vh] flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">All Reviews</h2>
                    <p className="mt-1 text-sm text-slate-400">{fixer.fullName} • {detailAllReviews.length} reviews</p>
                  </div>

                  <button type="button" onClick={() => setIsAllReviewsOpen(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                  <div className="space-y-6">
                    {detailAllReviews.map((review) => (
                      <div key={`all-${review.author}-${review.date}`} className="flex gap-4 rounded-2xl border border-slate-100 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                          {getInitials(review.author)}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-slate-900">{review.author}</p>
                              <div className="flex items-center gap-1 text-amber-400">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star key={`all-${review.author}-${index}`} size={13} fill={index < review.rating ? 'currentColor' : 'none'} />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs font-medium text-slate-400">{review.date}</span>
                          </div>

                          <p className="text-sm leading-7 text-slate-500">“{review.message}”</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 px-6 py-5 sm:px-8">
                  <button type="button" onClick={() => setIsAllReviewsOpen(false)} className="min-w-[120px] rounded-[1rem] bg-[#1D80E7] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-600 active:scale-95">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-[620px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl"
            >
              <form onSubmit={handleSubmitContact} className="flex max-h-[82vh] flex-col">
                <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5 sm:px-8">
                  <button type="button" onClick={handleCloseContact} className="inline-flex items-center text-blue-500 transition-colors hover:text-blue-600">
                    <ArrowLeft size={20} />
                  </button>

                  <button type="button" onClick={handleCloseContact} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-blue-50">
                          {fixer.imageUrl ? (
                            <img src={fixer.imageUrl} alt={fixer.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <UserCircle2 className="text-slate-300" size={40} />
                          )}
                        </div>
                        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                      </div>

                      <div className="space-y-1.5">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{fixer.fullName}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                          <span>ID: {fixer.id}</span>
                          <span className="text-slate-300">•</span>
                          <span>{formatCategoryLabel(getPrimaryCategory(fixer))} Expert</span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <div className="inline-flex items-center gap-1.5 font-semibold text-amber-500">
                            <Star size={14} fill="currentColor" />
                            <span>{fixer.rating ? fixer.rating.toFixed(1) : '—'} Rating</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5">
                            <BriefcaseBusiness size={15} className="text-slate-400" />
                            <span>{fixer.jobs || 0} Jobs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {contactError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{contactError}</p> : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-bold text-slate-700">First Name</span>
                        <input
                          type="text"
                          value={contactForm.firstName}
                          onChange={(event) => setContactForm((current) => ({ ...current, firstName: event.target.value }))}
                          placeholder="e.g. Michael"
                          className={INPUT_CLASS}
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-bold text-slate-700">Last Name</span>
                        <input
                          type="text"
                          value={contactForm.lastName}
                          onChange={(event) => setContactForm((current) => ({ ...current, lastName: event.target.value }))}
                          placeholder="e.g. Scott"
                          className={INPUT_CLASS}
                        />
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm font-bold text-slate-700">Email Address</span>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="m.scott@example.com"
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-bold text-slate-700">Phone Number</span>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                        placeholder="+1 (555) 000-0000"
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-bold text-slate-700">Message</span>
                      <textarea
                        rows={5}
                        value={contactForm.message}
                        onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                        placeholder="Describe the issue or purpose that you want to contact to the fixer"
                        className={TEXTAREA_CLASS}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-5 sm:px-8">
                  <button type="button" onClick={handleCloseContact} className="min-w-[120px] rounded-[1rem] border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" className="inline-flex min-w-[164px] items-center justify-center gap-2 rounded-[1rem] bg-[#1D80E7] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600 active:scale-95">
                    <Send size={15} />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
