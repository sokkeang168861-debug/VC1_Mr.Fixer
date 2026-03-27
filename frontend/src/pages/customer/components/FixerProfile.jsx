import React, { useEffect, useState } from 'react';
import {
  Star,
  MapPin,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { motion as Motion } from 'motion/react';
import httpClient from '@/api/httpClient';
import defaultProfile from '@/assets/image/default-profile.png';

function formatReviewDate(value) {
  if (!value) {
    return 'Recent';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recent';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function formatRating(value) {
  return Number(value || 0).toFixed(1);
}

function formatLocation(profile) {
  if (!profile) {
    return 'Location unavailable';
  }

  if (profile?.location) {
    return profile.location;
  }

  if (
    profile.latitude !== null &&
    profile.latitude !== undefined &&
    profile.longitude !== null &&
    profile.longitude !== undefined
  ) {
    return `${Number(profile.latitude).toFixed(4)}, ${Number(profile.longitude).toFixed(4)}`;
  }

  return 'Location unavailable';
}

function getCoordinateNumber(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function hasProfileCoordinates(profile) {
  return (
    getCoordinateNumber(profile?.latitude) !== null &&
    getCoordinateNumber(profile?.longitude) !== null
  );
}

function getOpenStreetMapEmbedUrl({ lat, lng }) {
  const delta = 0.01;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'FX';
}

export default function FixerProfile({
  bookingId,
  onBack,
  onBookAgain,
  name: fallbackName = 'Fixer User',
  avatar: fallbackAvatar = '',
  primaryCategory = 'Service',
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(bookingId));
  const [error, setError] = useState(() =>
    bookingId ? '' : 'Missing booking information.'
  );

  useEffect(() => {
    if (!bookingId) {
      return undefined;
    }

    let isMounted = true;

    setLoading(true);
    setError('');

    httpClient
      .get(`/user/bookings/${bookingId}/fixer-profile`)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setProfile(response?.data?.data || null);
      })
      .catch((requestError) => {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load fixer profile:', requestError);
        setProfile(null);
        setError(
          requestError?.response?.data?.message || 'Failed to load fixer profile.'
        );
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const displayName = profile?.full_name || fallbackName || 'Fixer User';
  const avatar = profile?.profile_img || fallbackAvatar || defaultProfile;
  const companyName = profile?.company_name || 'Mr. Fixer Partner';
  const categories = profile?.categories?.length
    ? profile.categories
    : [primaryCategory].filter(Boolean);
  const reviews = Array.isArray(profile?.recent_reviews) ? profile.recent_reviews : [];
  const locationLabel = formatLocation(profile);
  const mapCoordinates = hasProfileCoordinates(profile)
    ? {
        lat: getCoordinateNumber(profile?.latitude),
        lng: getCoordinateNumber(profile?.longitude),
      }
    : null;
  const firstName = displayName.trim().split(/\s+/)[0] || 'Fixer';
  const totalRatings = Number(profile?.ratings?.total_ratings || 0);
  const stats = [
    {
      label: 'Experience',
      value: `${Number(profile?.stats?.experience_years || 0)} Years`,
    },
    {
      label: 'Completed Jobs',
      value: `${Number(profile?.stats?.completed_jobs || 0)}`,
    },
  ];
  const detailedRatings = [
    { label: 'Quality of Work', score: Number(profile?.ratings?.quality_rating || 0) },
    { label: 'Speed of Service', score: Number(profile?.ratings?.speed_rating || 0) },
    {
      label: 'Price Fairness',
      score: Number(profile?.ratings?.price_fairness_rating || 0),
    },
    {
      label: 'Professional Behavior',
      score: Number(profile?.ratings?.behavior_rating || 0),
    },
  ];
  const shouldShowEmptyState = !loading && !error && !profile;

  return (
    <Motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-6xl mx-auto pb-12"
    >
      {loading && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading fixer profile...
        </div>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
        </div>
      )}

      {shouldShowEmptyState && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          No fixer profile data is available for this booking yet.
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={avatar}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = defaultProfile;
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-1">{displayName}</h1>

                <div className="flex items-center gap-2 text-purple-600 font-medium mb-3">
                  <Store className="w-4 h-4" />
                  <span className="text-sm">{companyName}</span>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                  <span className="font-bold text-slate-900">
                    {formatRating(profile?.ratings?.overall_rating)}
                  </span>
                  <span className="text-slate-400 text-sm ml-1">
                    - {totalRatings} Verified Reviews
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onBookAgain) {
                    onBookAgain(profile);
                    return;
                  }

                  onBack?.();
                }}
                className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#6D28D9]"
              >
                {onBookAgain ? 'Book Service' : 'Back to History'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center"
          >
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Shop Location &amp; Arrival
          </p>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <Clock className="h-4 w-4" />
            {profile?.location ? 'Verified location' : 'Location shared'}
          </span>
        </div>

        <div className="relative h-52 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm sm:h-64">
          {mapCoordinates ? (
            <>
              <iframe
                title={`${displayName} location`}
                src={getOpenStreetMapEmbedUrl(mapCoordinates)}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200" />
              <div className="absolute inset-0 opacity-60">
                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.9),rgba(255,255,255,0))]" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 shadow-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="mt-4 w-[340px] max-w-[90vw] rounded-full bg-white/90 px-5 py-3 text-center text-[11px] font-bold text-slate-800 shadow-xl backdrop-blur">
                    {locationLabel}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-900">About {firstName}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {profile?.bio || `${firstName} is available for service requests through Mr. Fixer.`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 p-8 sm:grid-cols-2">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Mail className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Email
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {profile?.email || 'Not available'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Phone className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Phone Number
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {profile?.phone || 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Detailed Ratings</h2>

          <div className="space-y-6">
            {detailedRatings.map((rating) => (
              <div key={rating.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">{rating.label}</span>
                  <span className="font-bold text-slate-900">
                    {formatRating(rating.score)} / 5.0
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${(rating.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Reviews</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {totalRatings} Total
            </span>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-6 space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={`mini-${review.id}`} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-600">
                    {getInitials(review.customer_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {review.customer_name}
                      </p>
                      <span className="text-xs text-slate-400">
                        {formatReviewDate(review.created_at)}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-3.5 w-3.5 ${
                            index < Number(review.overall_rating || 0)
                              ? 'text-orange-400 fill-orange-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {review.comment || 'Customer left a rating without a written comment.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No reviews yet.</div>
            )}
          </div>
        </section>
      </div>
    </Motion.div>
  );
}
