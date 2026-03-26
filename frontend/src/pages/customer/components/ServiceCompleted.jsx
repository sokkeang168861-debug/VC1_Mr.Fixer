import React from 'react';
import { CheckCircle2, ReceiptText } from 'lucide-react';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount || 0));
}

function formatReceiptDate(value) {
  if (!value) {
    return 'N/A';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
}

const ServiceCompleted = ({
  onPayment,
  receipt,
  loading = false,
  booking,
  submittingPayment = false,
}) => {
  const fixerName =
    receipt?.fixer?.name ||
    booking?.fixer_name ||
    booking?.fixer_company_name ||
    'Assigned Fixer';
  const serviceName =
    receipt?.service ||
    booking?.category_name ||
    'Completed Service';
  const orderId =
    receipt?.orderId ||
    `#BK-${String(booking?.id || '').padStart(5, '0')}`;
  const lineItems = Array.isArray(receipt?.items) ? receipt.items : [];
  const totalAmount =
    receipt?.amount ??
    lineItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Service Completed!</h1>
        <p className="text-slate-500">Your repair has been successfully finalized by the fixer.</p>
      </div>

      <div className="w-full bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 mb-8">
        <div className="flex items-center gap-2 text-violet-600 mb-4">
          <ReceiptText className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Official Receipt</span>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-1">Order {orderId}</h2>
        <p className="text-sm text-slate-400 font-medium mb-8">
          {formatReceiptDate(receipt?.date || booking?.created_at)}
        </p>

        <div className="border-t border-dashed border-slate-200 pt-8 mb-8">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center overflow-hidden">
              {receipt?.fixer?.avatar ? (
                <img
                  src={receipt.fixer.avatar}
                  alt={fixerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {fixerName.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{serviceName}</h4>
              <p className="text-xs text-slate-400">Service Provider: {fixerName}</p>
            </div>
          </div>

          {loading ? (
            <div className="mb-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-500">
              Loading official receipt...
            </div>
          ) : lineItems.length > 0 ? (
            <div className="space-y-4 mb-8">
              {lineItems.map((item) => (
                <div key={item.id} className="flex justify-between text-slate-600">
                  <span>{item.name}</span>
                  <span className="font-medium">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-500">
              No receipt items were found for this booking yet.
            </div>
          )}

          <div className="border-t border-violet-100 pt-6 flex justify-between items-center">
            <span className="text-xl font-bold text-slate-800">Total Amount Paid</span>
            <span className="text-3xl font-bold text-violet-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onPayment}
        disabled={submittingPayment}
        className="w-full max-w-sm py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl"
      >
        {submittingPayment ? 'Starting payment...' : 'Go to payment'}
      </button>
    </div>
  );
};

export default ServiceCompleted;
