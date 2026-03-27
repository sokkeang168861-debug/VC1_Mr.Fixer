import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Lock, Receipt, Loader2 } from 'lucide-react';
import httpClient from '@/api/httpClient';
import useActiveFixerBooking from '@/pages/fixer/hooks/useActiveFixerBooking';
import { getFixerJobOverview } from '@/pages/fixer/lib/jobOverview';

export default function ExpressCheckout() {
  const navigate = useNavigate();
  const { bookingId, job, loading, error } = useActiveFixerBooking();
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const jobOverview = useMemo(
    () => getFixerJobOverview(job, bookingId),
    [bookingId, job]
  );
  const qrValue = useMemo(() => {
    const reference = jobOverview?.booking_reference || bookingId || 'booking';
    return `https://mrfixer.app/pay/${reference}`;
  }, [bookingId, jobOverview]);
  const bookingStatus = String(job?.status || '').toLowerCase();
  const paymentStatus = String(job?.payment?.status || job?.payment_status || '').toLowerCase();

  const onComplete = async () => {
    if (!bookingId || submittingPayment) {
      return;
    }

    if (bookingStatus !== 'complete') {
      window.alert('This booking must be complete before payment can be received.');
      return;
    }

    if (paymentStatus === 'completed') {
      navigate('/dashboard/fixer/jobs', { replace: true });
      return;
    }

    if (paymentStatus === 'paid') {
      navigate('/dashboard/fixer/jobs/job-completed', {
        replace: true,
        state: { bookingId },
      });
      return;
    }

    try {
      setSubmittingPayment(true);
      await httpClient.post(`/fixer/provider/requests/${bookingId}/payments/paid`);
      navigate('/dashboard/fixer/jobs/job-completed', {
        replace: true,
        state: { bookingId },
      });
    } catch (requestError) {
      console.error(requestError);
      window.alert(
        requestError?.response?.data?.message ||
          'Failed to update payment status.'
      );
    } finally {
      setSubmittingPayment(false);
    }
  };

  useEffect(() => {
    if (bookingStatus === 'complete' && paymentStatus === 'paid') {
      navigate('/dashboard/fixer/jobs/job-completed', {
        replace: true,
        state: { bookingId },
      });
    } else if (bookingStatus === 'complete' && paymentStatus === 'completed') {
      navigate('/dashboard/fixer/jobs', {
        replace: true,
      });
    }
  }, [bookingId, bookingStatus, navigate, paymentStatus]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#FF7A1F]" size={36} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-sm font-semibold text-rose-700">
          {error || 'Unable to load active booking.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-50">
        {/* Header Section */}
        <div className="bg-[#FF7A1F] p-12 text-center text-white space-y-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
            <QrCode size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Express Checkout</h1>
          <p className="text-white/80 max-w-sm mx-auto leading-relaxed">
            The fastest way to pay. Scan the QR code below using your mobile camera or banking app.
          </p>
        </div>

        {/* QR Code Section */}
        <div className="p-12 flex flex-col items-center space-y-12">
          <div className="relative p-8 bg-white rounded-[48px] shadow-xl border border-gray-50">
            <div className="w-64 h-64 bg-gray-50 flex items-center justify-center overflow-hidden rounded-2xl">
              {/* Placeholder for QR Code */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrValue)}`} 
                alt="Payment QR Code"
                className="w-full h-full p-4"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#FF7A1F]/20 rounded-tl-[48px]" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#FF7A1F]/20 rounded-tr-[48px]" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#FF7A1F]/20 rounded-bl-[48px]" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#FF7A1F]/20 rounded-br-[48px]" />
          </div>

          {/* Order Summary Bar */}
          <div className="w-full max-w-md bg-[#FFF9F0] rounded-2xl p-4 flex items-center justify-between border border-[#FFF5ED]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF7A1F] shadow-sm">
                <Receipt size={18} />
              </div>
              <p className="text-sm font-bold text-gray-700">
                Order ID: <span className="text-gray-400">#{jobOverview?.booking_reference || bookingId}</span>
              </p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              ${Number(jobOverview?.total_estimated_price || 0).toFixed(2)}
            </p>
          </div>

          {/* Action Button */}
          <div className="w-full max-w-md space-y-6">
            <button 
              onClick={onComplete}
              disabled={submittingPayment}
              className="w-full bg-[#FF7A1F] hover:bg-[#E66D1C] text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-[#FF7A1F]/20 text-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingPayment ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Updating Payment...
                </span>
              ) : (
                'Receive Payment'
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em]">
              <Lock size={12} />
              <span>Secure Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
