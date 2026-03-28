import React, { useState } from 'react';
import { motion as Motion } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  User,
  ShieldCheck,
  Star,
  Wallet,
  Wrench,
} from 'lucide-react';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount || 0));
}

function formatDateTime(value) {
  if (!value) {
    return 'As soon as possible';
  }

  return new Date(value).toLocaleString();
}

const BookingAgreement = ({ booking, onConfirm, onReject, submitting = false }) => {
  const [agreed, setAgreed] = useState(false);

  const proposalItems = Array.isArray(booking?.proposal_items) ? booking.proposal_items : [];
  const calculatedTotal = proposalItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalAmount = booking?.service_fee ?? calculatedTotal;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Confirm Price</h1>
        <p className="text-slate-500">Your fixer accepted the request. Review the proposal and confirm the price to continue.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Booking Review</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Service</p>
                <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                  {booking?.category_image ? (
                    <img
                      src={booking.category_image}
                      alt={booking?.category_name || 'Service'}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Wrench className="h-7 w-7 text-violet-600" />
                  )}
                </div>
                <h4 className="font-bold text-slate-800">{booking?.category_name || 'Service Request'}</h4>
                <p className="mt-3 text-sm text-slate-500">{booking?.issue_description || 'No issue description provided.'}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixer Accepted</p>
                </div>
                <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                  {booking?.fixer_avatar ? (
                    <img
                      src={booking.fixer_avatar}
                      alt={booking?.fixer_name || 'Assigned Fixer'}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-7 w-7 text-violet-600" />
                  )}
                </div>
                <h4 className="font-bold text-slate-800">{booking?.fixer_name || 'Assigned Fixer'}</h4>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span>Proposal is ready for your confirmation.</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date & Time</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-bold">{formatDateTime(booking?.scheduled_at || booking?.created_at)}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-bold">{booking?.service_address || 'No address provided'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Proposal Breakdown</h3>
            </div>

            {proposalItems.length > 0 ? (
              <div className="space-y-3">
                {proposalItems.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4"
                  >
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                No line items were provided. The fixer submitted a flat proposal total instead.
              </div>
            )}

            <label className="mt-6 flex items-start gap-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="peer h-5 w-5 appearance-none rounded-md border border-slate-300 checked:border-violet-600 checked:bg-violet-600"
                />
                <CheckCircle2 className="pointer-events-none absolute inset-0 h-5 w-5 p-0.5 text-white opacity-0 peer-checked:opacity-100" />
              </div>
              <span className="text-xs font-medium text-slate-600 leading-relaxed">
                I reviewed the fixer&apos;s proposed price and agree to continue with this booking.
              </span>
            </label>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-4 text-violet-700">
              <Info className="w-5 h-5" />
              <p className="text-xs font-bold">This confirms the proposal amount. Payment still happens after the job is completed.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onReject}
              className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 sticky top-8">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-slate-800">Total Amount</p>
              <p className="text-3xl font-bold text-violet-600">{formatCurrency(totalAmount)}</p>
            </div>
            <p className="mb-2 text-[10px] text-slate-400 font-bold uppercase mt-1">Confirmed before service begins</p>
          </div>

          <button
            type="button"
            disabled={!agreed || submitting}
            onClick={onConfirm}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${agreed && !submitting
              ? 'bg-violet-600 text-white shadow-violet-200 hover:bg-violet-700'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
          >
            <Calendar className="w-5 h-5" />
            {submitting ? 'Confirming...' : 'Confirm Price'}
          </button>

          <p className="text-center text-[10px] text-slate-400 mt-6 leading-relaxed">
            You will move to the next step after confirming this proposal.
          </p>
        </div>
      </div>
    </Motion.div>
  );
};

export default BookingAgreement;


