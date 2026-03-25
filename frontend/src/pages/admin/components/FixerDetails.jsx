import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import httpClient from '@/api/httpClient';

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

function buildFallbackAvatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Fixer'
  )}&background=E0E7FF&color=1F2937`;
}

function formatJobId(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'N/A';
  }

  return `JB-${String(numericValue).padStart(4, '0')}`;
}

function formatRoleText(profile = {}) {
  if (Array.isArray(profile.categories) && profile.categories.length > 0) {
    return profile.categories.join(' • ');
  }

  return profile.companyName || 'Fixer Specialist';
}

const buildInitialState = (fixer) => ({
  profile: {
    ...fixer,
    name: fixer?.name || 'Fixer',
    avatar: fixer?.avatar || buildFallbackAvatar(fixer?.name),
    fixerId: fixer?.fixerId || 'FX-0000',
    rating: Number(fixer?.rating || 0),
    totalBookings: Number(fixer?.jobs || fixer?.totalBookings || 0),
    categories: Array.isArray(fixer?.categories) ? fixer.categories : [],
  },
  overallRating: {
    value: Number(fixer?.rating || 0),
    outOf: 5,
    totalRatings: 0,
  },
  detailedRatings: [],
  reviews: [],
  transactions: [],
});

const FixerDetail = ({ fixer, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [detailData, setDetailData] = useState(() => buildInitialState(fixer));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFixerDetail = async () => {
      if (!fixer?.providerId) {
        if (isMounted) {
          setDetailData(buildInitialState(fixer));
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await httpClient.get(`/admin/fixers/${fixer.providerId}/detail`);
        const payload = response?.data?.data;

        if (!isMounted || !payload) {
          return;
        }

        setDetailData({
          profile: {
            ...payload.profile,
            name: payload.profile?.name || fixer?.name || 'Fixer',
            avatar:
              payload.profile?.avatar ||
              fixer?.avatar ||
              buildFallbackAvatar(payload.profile?.name || fixer?.name),
            fixerId: payload.profile?.fixerId || fixer?.fixerId || 'FX-0000',
            rating: Number(
              payload.overallRating?.value ??
                payload.profile?.rating ??
                fixer?.rating ??
                0
            ),
            totalBookings: Number(
              payload.profile?.totalBookings ??
                fixer?.jobs ??
                fixer?.totalBookings ??
                0
            ),
            categories: Array.isArray(payload.profile?.categories)
              ? payload.profile.categories
              : [],
          },
          overallRating: {
            value: Number(payload.overallRating?.value || 0),
            outOf: Number(payload.overallRating?.outOf || 5),
            totalRatings: Number(payload.overallRating?.totalRatings || 0),
          },
          detailedRatings: Array.isArray(payload.detailedRatings)
            ? payload.detailedRatings
            : [],
          reviews: Array.isArray(payload.reviews) ? payload.reviews : [],
          transactions: Array.isArray(payload.transactions)
            ? payload.transactions
            : [],
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            'Failed to load fixer details.'
        );
        setDetailData(buildInitialState(fixer));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFixerDetail();

    return () => {
      isMounted = false;
    };
  }, [fixer]);

  const profile = detailData.profile;
  const roleText = useMemo(() => formatRoleText(profile), [profile]);
  const transactions = detailData.transactions;

  return (
    <Motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profile.avatar || buildFallbackAvatar(profile.name)}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mt-1">
                <span>ID: {profile.fixerId}</span>
                <span>&bull;</span>
                <span>{roleText}</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-orange-400 text-orange-400" />
                  <span className="text-sm font-bold text-slate-700">
                    {Number(detailData.overallRating.value || 0).toFixed(1)} Rating
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {profile.totalBookings} Jobs
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="font-bold text-lg">Detailed Ratings</h3>
          </div>
          <div className="p-8 space-y-8">
            {loading ? (
              <div className="text-sm text-slate-500">Loading ratings...</div>
            ) : detailData.detailedRatings.length > 0 ? (
              detailData.detailedRatings.map((rating) => (
                <div key={rating.key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">
                      {rating.label}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {Number(rating.value || 0).toFixed(1)} / {rating.outOf || 5}.0
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Number(rating.percentage || 0)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No ratings available yet.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg">Reviews</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {detailData.overallRating.totalRatings} Total
            </span>
          </div>
          <div className="p-8 flex-1 space-y-8">
            {loading ? (
              <div className="text-sm text-slate-500">Loading reviews...</div>
            ) : detailData.reviews.length > 0 ? (
              detailData.reviews.map((review) => (
                <div key={review.id} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {review.initials}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{review.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              size={10}
                              className={
                                index < Math.round(Number(review.rating || 0))
                                  ? 'fill-orange-400 text-orange-400'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    {review.comment || 'No review comment provided.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No reviews available yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Transaction</h2>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="px-8 pt-8 border-b border-slate-50">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-4 text-sm font-bold transition-all ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                All Jobs
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Job ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Total Paid</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Commission</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Net Payout</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-sm text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : null}

              {!loading ? (
                <AnimatePresence mode="wait">
                  {transactions.map((transaction) => (
                    <Motion.tr
                      key={transaction.booking_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-8 py-8 text-center text-sm font-bold text-slate-800">
                        {formatDate(transaction.paid_at || transaction.created_at)}
                      </td>
                      <td className="px-8 py-8 text-center text-sm font-bold text-slate-800">
                        {formatJobId(transaction.booking_id)}
                      </td>
                      <td className="px-8 py-8 text-center text-sm font-bold text-slate-800">
                        {formatCurrency(transaction.total_paid)}
                      </td>
                      <td className="px-8 py-8 text-center text-sm font-bold text-blue-500">
                        {formatCurrency(transaction.commission)}
                      </td>
                      <td className="px-8 py-8 text-center text-sm font-bold text-emerald-500">
                        {formatCurrency(transaction.net_payout)}
                      </td>
                    </Motion.tr>
                  ))}
                </AnimatePresence>
              ) : null}

              {!loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-sm text-slate-500">
                    No transactions available yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </Motion.div>
  );
};

export default FixerDetail;
