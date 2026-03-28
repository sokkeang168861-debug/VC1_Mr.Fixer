import React, { useEffect, useRef, useState } from 'react';
import { motion as Motion } from 'motion/react';
import { Hash, LoaderCircle, RefreshCw, User, Wrench } from 'lucide-react';

const WaitingConfirmation = ({ booking, refreshing = false, onRefresh, onTimeout }) => {
  const issueDescription = booking?.issue_description || booking?.issueDescription || '';
  const serviceAddress = booking?.service_address || booking?.serviceAddress || '';
  const categoryName = booking?.category_name || booking?.categoryName || '';
  const categoryImage = booking?.category_image || booking?.categoryImage || '';
  const fixerName =
    booking?.fixer_name ||
    booking?.fixerName ||
    booking?.fixer_company_name ||
    'Selected fixer';
  const fixerAvatar = booking?.fixer_avatar || booking?.fixerAvatar || '';
  const bookingId = booking?.id || booking?.bookingId || 'N/A';
  const timeoutTriggeredRef = useRef(false);
  const deadlineRef = useRef(null);
  const [remainingMs, setRemainingMs] = useState(3 * 60 * 1000);

  useEffect(() => {
    timeoutTriggeredRef.current = false;
    const createdAt = booking?.created_at || booking?.createdAt;
    const createdTime = createdAt ? new Date(createdAt).getTime() : Number.NaN;
    const fallbackTime = Date.now() + (3 * 60 * 1000);
    const nextDeadline = Number.isFinite(createdTime)
      ? Math.max(createdTime + (3 * 60 * 1000), fallbackTime)
      : fallbackTime;

    deadlineRef.current = nextDeadline;
    const timeoutId = window.setTimeout(() => {
      setRemainingMs(Math.max(0, nextDeadline - Date.now()));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [booking?.created_at, booking?.createdAt]);

  useEffect(() => {
    if (remainingMs > 0) {
      return undefined;
    }

    if (timeoutTriggeredRef.current) {
      return undefined;
    }

    timeoutTriggeredRef.current = true;
    const nextDeadline = Date.now() + (3 * 60 * 1000);
    deadlineRef.current = nextDeadline;
    window.setTimeout(() => {
      setRemainingMs(3 * 60 * 1000);
    }, 0);
    onTimeout?.();
    return undefined;
  }, [onTimeout, remainingMs]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const deadline = deadlineRef.current;

      if (!deadline) {
        return;
      }

      setRemainingMs(Math.max(0, deadline - Date.now()));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
      <div className="relative mb-12">
        {/* Radar Animation */}
        <div className="w-32 h-32 bg-violet-100 rounded-full flex items-center justify-center relative z-10">
          <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white">
            <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Pulsing Rings */}
        <Motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 bg-violet-400 rounded-full -z-0"
        />
        <Motion.div
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-0 bg-violet-300 rounded-full -z-0"
        />
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-4">Waiting for fixer response...</h2>
      <p className="text-slate-500 mb-12 max-w-md">
        Your booking is still <span className="text-violet-600 font-bold">pending</span>. We&apos;re still checking for the fixer&apos;s response.
      </p>

      {(categoryName || issueDescription || serviceAddress || fixerName) && (
        <div className="mb-10 w-full max-w-2xl rounded-3xl border border-slate-100 bg-slate-50 px-6 py-5 text-left">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
              {categoryImage ? (
                <img
                  src={categoryImage}
                  alt={categoryName || 'Service category'}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Wrench className="h-7 w-7 text-violet-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {categoryName && (
                <p className="text-lg font-bold text-slate-800">{categoryName}</p>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <Hash className="h-3.5 w-3.5" />
                Booking ID: {bookingId}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-violet-100 text-violet-700">
              {fixerAvatar ? (
                <img
                  src={fixerAvatar}
                  alt={fixerName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Fixer Name</p>
              <p className="truncate text-sm font-bold text-slate-800">{fixerName}</p>
            </div>
          </div>

          {issueDescription && (
            <p className="mt-4 text-sm text-slate-600">{issueDescription}</p>
          )}
          {serviceAddress && (
            <p className="mt-3 text-xs font-medium text-slate-400">{serviceAddress}</p>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-6 w-full pt-12 border-t border-slate-50">
        <p className="text-xs text-slate-400 font-medium animate-pulse">Checking for fixer response...</p>

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
  );
};

export default WaitingConfirmation;
