import React, { useState } from 'react';
import { CheckCircle2, Star, Download, Send } from 'lucide-react';
import {
  buildPrintableReceiptHtml,
  formatCurrency,
  formatReceiptDate,
  formatStatusLabel,
  getReceiptLineItems,
} from '@/lib/receipt';

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

const PaymentSuccess = ({
  onSubmitReview,
  onDone,
  booking,
  receipt,
  payment,
  completingPayment = false,
}) => {
  const [ratings, setRatings] = useState({
    quality: 0,
    speed: 0,
    price: 0,
    behavior: 0,
    overall: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const orderId =
    receipt?.orderId ||
    `#BK-${String(booking?.id || '').padStart(5, '0')}`;
  const serviceName =
    receipt?.service ||
    booking?.category_name ||
    'Completed Service';
  const totalPaid =
    payment?.amount ??
    receipt?.amount ??
    booking?.service_fee ??
    0;
  const paymentStatus = formatStatusLabel(payment?.status, 'Paid');
  const receiptDate = formatReceiptDate(
    payment?.paid_at ||
    receipt?.date ||
    booking?.created_at
  );
  const lineItems = getReceiptLineItems(receipt, serviceName, totalPaid);
  const categories = [
    { id: 'quality', label: 'QUALITY' },
    { id: 'speed', label: 'SPEED' },
    { id: 'price', label: 'PRICE' },
    { id: 'behavior', label: 'BEHAVIOR' },
  ];
  const canSubmitReview = comment.trim().length > 0 && !isSubmittingReview;

  const handleRating = (category, value) => {
    setSubmitError('');
    setRatings((prev) => ({
      ...prev,
      [category]: prev[category] === value ? 0 : value,
    }));
  };

  const handleSubmitReview = async () => {
    if (!canSubmitReview) {
      if (!comment.trim()) {
        setSubmitError('Please enter your feedback before submitting.');
      }
      return;
    }

    try {
      setIsSubmittingReview(true);
      setSubmitError('');

      await onSubmitReview?.({
        quality_rating: ratings.quality,
        speed_rating: ratings.speed,
        price_fairness_rating: ratings.price,
        behavior_rating: ratings.behavior,
        overall_rating: ratings.overall,
        comment: comment.trim(),
      });
    } catch (error) {
      console.error(error);
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to submit review.'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDownloadReceipt = () => {
    const fileName = `Receipt_${String(orderId).replace(/[^a-zA-Z0-9-]/g, '') || 'booking'}`;
    const printWindow = window.open('', '_blank', 'width=900,height=1200');

    if (!printWindow) {
      window.alert('Please allow pop-ups to save the receipt as PDF.');
      return;
    }

    printWindow.document.write(
      buildPrintableReceiptHtml({
        receipt,
        booking,
        payment,
      })
    );
    printWindow.document.close();
    printWindow.document.title = fileName;
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PaymentProgressBar currentStep={3} />
      
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 mb-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Payment Successfully!</h1>
          <p className="text-slate-500">Your repair has been successfully finalized by the fixer.</p>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 mb-8">
          <div className="flex items-center gap-2 text-violet-600 mb-6">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Order Summary</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Order Number</span>
              <span className="font-bold text-slate-800">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Service</span>
              <span className="font-bold text-slate-800">{serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Payment Status</span>
              <span className="font-bold text-emerald-600">{paymentStatus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Receipt Date</span>
              <span className="font-bold text-slate-800">{receiptDate}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-slate-500 text-sm font-semibold">Receipt Items</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {lineItems.length} item{lineItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-800 font-bold">Total Paid</span>
              <span className="text-2xl font-bold text-violet-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8">
          <div className="flex items-center gap-2 text-violet-600 mb-8">
            <Star className="w-5 h-5 fill-violet-600" />
            <h3 className="text-xl font-bold text-slate-800">Rate Your Experience</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Rating</p>
              {categories.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider">{item.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`${item.id}-${star}`}
                        type="button"
                        onClick={() => handleRating(item.id, star)}
                        className="p-0.5"
                        aria-label={`${item.label} ${star} stars`}
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            star <= ratings[item.id]
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Feedback:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star} 
                    type="button"
                    onClick={() => handleRating('overall', star)}
                    className="p-0.5"
                    aria-label={`Overall ${star} stars`}
                  >
                    <Star 
                      className={`w-10 h-10 cursor-pointer transition-all ${
                        ratings.overall >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Please help to share your feedback of our service..."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all resize-none"
              />
            </div>
          </div>

          {submitError ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {submitError}
            </div>
          ) : null}

          <button 
            type="button"
            onClick={handleSubmitReview}
            disabled={!canSubmitReview}
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-100 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all"
        >
          <Download className="w-4 h-4" />
          Download PDF Receipt
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={completingPayment}
          className="px-10 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
        >
          {completingPayment ? 'Finishing...' : 'Done'}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
