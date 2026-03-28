import React from 'react';
import { motion as Motion } from 'motion/react';
import {
  Calendar,
  Clock,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react';

function formatDateTime(value) {
  if (!value) {
    return 'Just now';
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'Just now';
  }
}

function formatUrgency(value) {
  const normalized = String(value || 'low').toLowerCase();

  if (normalized === 'high') return 'Emergency';
  if (normalized === 'medium') return 'Urgent';
  return 'Normal';
}

function getInitials(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || 'FX';
}

function formatDisplayText(value, fallback = '') {
  const text = String(value || fallback).trim();

  if (!text) {
    return fallback;
  }

  const hasLetters = /[A-Za-z]/.test(text);
  if (!hasLetters || text !== text.toUpperCase()) {
    return text;
  }

  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function DetailRow({ icon: Icon, label, value, compact = false }) {
  return (
    <div className={`flex gap-3 ${compact ? 'items-start' : 'items-center'}`}>
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" /> : null}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{label}</p>
        <p className={`mt-2 text-base text-slate-700 ${compact ? 'leading-relaxed' : 'font-semibold'}`}>{value}</p>
      </div>
    </div>
  );
}

const WaitingConfirmation = ({ booking, refreshing = false, onRefresh }) => {
  const issueDescription = booking?.issue_description || booking?.issueDescription || '';
  const serviceAddress = booking?.service_address || booking?.serviceAddress || '';
  const categoryName = booking?.category_name || booking?.categoryName || '';
  const fixerName = booking?.fixer_name || booking?.fixerName || 'Assigned Fixer';
  const fixerPhone = booking?.fixer_phone || booking?.fixerPhone || '';
  const fixerEmail = booking?.fixer_email || booking?.fixerEmail || '';
  const fixerCompanyName = booking?.fixer_company_name || booking?.fixerCompanyName || '';
  const fixerLocation = booking?.provider_location || booking?.providerLocation || '';
  const fixerLatitude = booking?.provider_latitude ?? booking?.providerLatitude;
  const fixerLongitude = booking?.provider_longitude ?? booking?.providerLongitude;
  const fixerRating = Number(booking?.fixer_overall_rating ?? booking?.fixerRating ?? 0);
  const fixerReviews = Number(booking?.fixer_total_ratings ?? booking?.fixerReviews ?? 0);
  const fixerImage = booking?.fixer_profile_img || booking?.fixerProfileImg || '';
  const createdAt = booking?.created_at || booking?.createdAt || '';
  const scheduledAt = booking?.scheduled_at || booking?.scheduledAt || '';
  const urgencyLabel = formatUrgency(booking?.urgent_level || booking?.urgentLevel);
  const bookingId = booking?.id ? `#BK-${String(booking.id).padStart(5, '0')}` : 'Pending assignment';
  const fixerDisplayName = formatDisplayText(fixerName, 'Assigned Fixer');
  const fixerDisplayCompanyName = formatDisplayText(
    fixerCompanyName || categoryName || 'Mr. Fixer Partner',
    'Mr. Fixer Partner'
  );
  const categoryDisplayName = formatDisplayText(categoryName || 'Service Request', 'Service Request');
  const fixerLocationLabel = fixerLocation || (
    fixerLatitude !== null &&
    fixerLatitude !== undefined &&
    fixerLongitude !== null &&
    fixerLongitude !== undefined
      ? `${fixerLatitude}, ${fixerLongitude}`
      : 'Location not available yet'
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-10">
            <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-violet-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white">
                  <div className="h-1 w-1 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <Motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-violet-400"
            />
            <Motion.div
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              className="absolute inset-0 rounded-full bg-violet-300"
            />
          </div>

          <h2 className="mb-4 text-3xl font-bold text-slate-800">Waiting for fixer response...</h2>
          <p className="mb-10 max-w-2xl text-slate-500">
            Your booking has been created and is still <span className="font-bold text-violet-600">pending</span>.
            You can leave this page and come back later. We&apos;ll keep showing this screen until the status changes.
          </p>

          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-violet-700">
            <ShieldCheck className="h-4 w-4" />
            Booking status: pending
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-100 bg-slate-50 p-5 text-left sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-7">
              <div className="flex items-center gap-4">
                {fixerImage ? (
                  <img
                    src={fixerImage}
                    alt={fixerDisplayName}
                    className="h-16 w-16 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-lg font-extrabold text-violet-700">
                    {getInitials(fixerDisplayName)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-2xl font-bold leading-tight text-slate-900 sm:text-[2.1rem]">
                    {fixerDisplayName}
                  </h4>
                  <p className="mt-1 truncate text-sm font-semibold text-violet-600 sm:text-base">
                    {fixerDisplayCompanyName}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-600">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {fixerRating > 0 ? fixerRating.toFixed(1) : 'New'}
                    </span>
                    <span>{fixerReviews > 0 ? `${fixerReviews} reviews` : 'Awaiting first reviews'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
                <DetailRow label="Location" value={fixerLocationLabel} icon={MapPin} compact />
                <div className="border-t border-slate-100 pt-5">
                  <DetailRow label="Phone" value={fixerPhone || 'Available after response'} icon={Phone} />
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <DetailRow label="Email" value={fixerEmail || 'Available after response'} icon={Mail} compact />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Booking Info</p>
                    <h3 className="text-lg font-bold text-slate-800">Request summary</h3>
                  </div>
                </div>

                <div className="space-y-5">
                  <DetailRow label="Booking ID" value={bookingId} />
                  <div className="border-t border-slate-100 pt-5">
                    <DetailRow label="Urgency" value={urgencyLabel} />
                  </div>
                  <div className="border-t border-slate-100 pt-5">
                    <DetailRow label="Category" value={categoryDisplayName} />
                  </div>
                  <div className="border-t border-slate-100 pt-5">
                    <DetailRow label="Requested At" value={formatDateTime(createdAt)} icon={Clock} compact />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-7">
                <div className="space-y-5">
                  <DetailRow
                    label="Issue Description"
                    value={issueDescription || 'No issue description provided.'}
                    compact
                  />

                  <div className="border-t border-slate-100 pt-5">
                    <DetailRow
                      label="Service Address"
                      value={serviceAddress || 'No address provided.'}
                      icon={MapPin}
                      compact
                    />
                  </div>

                  {scheduledAt ? (
                    <div className="border-t border-slate-100 pt-5">
                      <DetailRow label="Service Time" value={formatDateTime(scheduledAt)} icon={Calendar} compact />
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-10 flex w-full flex-col items-center gap-6 border-t border-slate-100 pt-10">
          <p className="animate-pulse text-xs font-medium text-slate-400">Checking for fixer response...</p>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimated Wait</p>
            <div className="flex items-center gap-2 text-slate-800">
              <Clock className="h-5 w-5 text-violet-600" />
              <span className="text-xl font-bold">2-3 mins</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {refreshing ? 'Refreshing status...' : 'Refresh status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingConfirmation;
