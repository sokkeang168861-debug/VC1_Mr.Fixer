import React from 'react';
import { QrCode } from 'lucide-react';

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
  const fixerQr = booking?.fixer_qr || null;

  return (
    <div className="max-w-5xl mx-auto">
      <PaymentProgressBar currentStep={2} />
      
      <div className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50 min-h-[700px] flex flex-col">
        {/* Purple Header Section */}
        <div className="bg-violet-600 p-16 text-center text-white flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold mb-6">Express Checkout</h2>
          <p className="text-violet-100 max-w-md leading-relaxed opacity-90">
            The fastest way to pay. Scan the QR code below using your mobile camera or banking app.
          </p>
        </div>

        {/* QR Code Section */}
        <div className="flex-1 flex items-center justify-center p-20">
          <div className="p-8 bg-white rounded-[32px] border-2 border-slate-50 shadow-inner text-center">
            <div className="w-64 h-64 mx-auto rounded-[28px] border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
              {fixerQr ? (
                <img
                  src={fixerQr}
                  alt="Fixer payment QR code"
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="px-6 text-center">
                  <QrCode className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    QR code not available yet
                  </p>
                </div>
              )}
            </div>
            <p className="mt-6 text-sm font-semibold text-slate-800">
              Payment Status: {String(payment?.status || 'pending').toUpperCase()}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {refreshing
                ? 'Checking payment status...'
                : 'This screen will continue to the success page when the payment status becomes success.'}
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Amount: {formatCurrency(payment?.amount)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Pay to {booking?.fixer_company_name || booking?.fixer_name || 'your fixer'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
