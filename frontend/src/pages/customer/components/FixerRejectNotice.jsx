import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const FixerRejectNotice = ({
  message = 'The fixer did not respond in time, so this booking was automatically rejected.',
  onGoBack,
}) => {
  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-rose-100 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle className="h-10 w-10" />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">
        Booking Update
      </p>
      <h2 className="mt-3 text-3xl font-bold text-slate-900">
        Fixer Rejected
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onGoBack}
        className="mx-auto mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </button>
    </div>
  );
};

export default FixerRejectNotice;
