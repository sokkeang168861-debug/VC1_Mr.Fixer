import React from 'react';
import { Lock, QrCode, Receipt } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/assets';

const PaymentProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'CONFIRMED' },
    { id: 2, label: 'PAYMENT' },
    { id: 3, label: 'RECEIPT' },
  ];

  return (
    <div className="flex items-center justify-center gap-12 mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all ${
              currentStep > step.id 
                ? 'bg-violet-600 border-violet-600 text-white' 
                : currentStep === step.id 
                  ? 'bg-white border-violet-600 text-violet-600 shadow-lg shadow-violet-100' 
                  : 'bg-white border-slate-100 text-slate-300'
            }`}>
              {currentStep > step.id ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : step.id}
            </div>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${
              currentStep >= step.id ? 'text-violet-600' : 'text-slate-300'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 w-16 rounded-full ${
              currentStep > step.id ? 'bg-violet-600' : 'bg-slate-100'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount || 0));
}

const PaymentScreen = ({ payment, booking, refreshing = false }) => {
  const paymentStatus = String(payment?.status || 'pending').toUpperCase();
  const qrImageSrc = booking?.fixer_qr_img
    ? resolveUploadUrl(booking.fixer_qr_img)
    : '';

  return (
    <div className="max-w-5xl mx-auto">
      <PaymentProgressBar currentStep={2} />
      
      <div className="mx-auto w-full max-w-md rounded-[32px] border border-slate-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="bg-[#FF7A1F] px-8 pb-9 pt-8 text-center text-white">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <QrCode className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Express Checkout</h2>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/85">
            The fastest way to pay. Scan the QR code below using your mobile camera or banking app.
          </p>
        </div>

        <div className="px-8 pb-8 pt-7">
          <div className="mx-auto w-fit rounded-[28px] bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
            {qrImageSrc ? (
              <img
                src={qrImageSrc}
                alt="Payment QR Code"
                className="h-52 w-52 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm font-medium text-slate-400">
                No payment QR uploaded yet.
              </div>
            )}
          </div>

          <div className="mx-auto mt-7 max-w-xs rounded-2xl border border-[#FFF1E5] bg-[#FFF8F1] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#FF7A1F] shadow-sm">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFB27A]">Payment Status</p>
                  <p className="text-sm font-bold text-slate-800">{paymentStatus}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(payment?.amount)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {refreshing ? 'Checking payment status...' : 'Payment will continue automatically after success.'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Keep this page open while you complete payment in your banking app.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
            <Lock className="h-3.5 w-3.5" />
            <span>Secure Payment Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
