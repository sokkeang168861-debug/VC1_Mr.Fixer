import React from 'react';
import { motion as Motion } from 'motion/react';
import { Clock, LoaderCircle, RefreshCw } from 'lucide-react';

const WaitingConfirmation = ({ booking, refreshing = false, onRefresh }) => {
  const issueDescription = booking?.issue_description || booking?.issueDescription || '';
  const serviceAddress = booking?.service_address || booking?.serviceAddress || '';
  const categoryName = booking?.category_name || booking?.categoryName || '';

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
        Your booking has been created and is still <span className="text-violet-600 font-bold">pending</span>. You can leave this page and come back later. We&apos;ll keep showing this screen until the status changes.
      </p>

      {(categoryName || issueDescription || serviceAddress) && (
        <div className="mb-10 w-full max-w-2xl rounded-3xl border border-slate-100 bg-slate-50 px-6 py-5 text-left">
          {categoryName && (
            <p className="text-sm font-bold text-slate-800">{categoryName}</p>
          )}
          {issueDescription && (
            <p className="mt-2 text-sm text-slate-600">{issueDescription}</p>
          )}
          {serviceAddress && (
            <p className="mt-3 text-xs font-medium text-slate-400">{serviceAddress}</p>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-6 w-full pt-12 border-t border-slate-50">
        <p className="text-xs text-slate-400 font-medium animate-pulse">Checking for fixer response...</p>
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Wait</p>
          <div className="flex items-center gap-2 text-slate-800">
            <Clock className="w-5 h-5 text-violet-600" />
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
  );
};

export default WaitingConfirmation;
