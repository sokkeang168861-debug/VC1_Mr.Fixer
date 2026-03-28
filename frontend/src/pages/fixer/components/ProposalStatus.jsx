import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Clock, Loader2, XCircle } from 'lucide-react';
import httpClient from '@/api/httpClient';
import {
  getActiveFixerBookingId,
  setActiveFixerBookingId,
} from '@/pages/fixer/lib/activeBooking';

export default function ProposalStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId || getActiveFixerBookingId();
  const [bookingStatus, setBookingStatus] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [missingBooking, setMissingBooking] = useState(false);
  const alertShownRef = React.useRef('');

  useEffect(() => {
    if (!bookingId) {
      setMissingBooking(true);
      setLoadingStatus(false);
      return undefined;
    }

    let isMounted = true;
    let intervalId;

    const loadBookingStatus = async ({ silent = false } = {}) => {
      if (!silent && isMounted) {
        setLoadingStatus(true);
      }

      try {
        const response = await httpClient.get(`/fixer/provider/requests/${bookingId}`);
        const nextStatus = response?.data?.data?.status || '';

        if (!isMounted) {
          return;
        }

        setMissingBooking(false);
        setBookingStatus(nextStatus);

        if (['customer_accept', 'arrived'].includes(String(nextStatus).toLowerCase())) {
          navigate('/dashboard/fixer/jobs/heading-to-customer', {
            state: { bookingId },
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(error);
        setMissingBooking(error?.response?.status === 404);
      } finally {
        if (!silent && isMounted) {
          setLoadingStatus(false);
        }
      }
    };
    
    loadBookingStatus();
    intervalId = window.setInterval(() => {
      loadBookingStatus({ silent: true });
    }, 5000);

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [bookingId, navigate]);
  
  useEffect(() => {
    if (bookingId) {
      setActiveFixerBookingId(bookingId);
    }
  }, [bookingId]);

  const normalizedStatus = String(bookingStatus || '').toLowerCase();
  const isRejected = ['customer_reject', 'fixer_reject'].includes(normalizedStatus);
  const isAccepted = ['customer_accept', 'arrived'].includes(normalizedStatus);

  useEffect(() => {
    if (!normalizedStatus || alertShownRef.current === normalizedStatus) {
      return;
    }

    if (normalizedStatus === 'customer_reject') {
      window.alert('Customer rejected the booking.');
      alertShownRef.current = normalizedStatus;
      return;
    }

    if (normalizedStatus === 'fixer_reject') {
      window.alert('Fixer rejected the booking request.');
      alertShownRef.current = normalizedStatus;
    }
  }, [normalizedStatus]);

  useEffect(() => {
    if (!missingBooking) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate('/dashboard/fixer/jobs', { replace: true });
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [missingBooking, navigate]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      {/* Top Card: Success Message */}
      <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-[#E7F9ED] rounded-full flex items-center justify-center text-[#22C55E] mb-8">
          <div className="w-12 h-12 border-4 border-[#22C55E] rounded-full flex items-center justify-center">
            <Check size={32} strokeWidth={3} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Proposal Submitted</h2>
        <p className="text-gray-400 max-w-md leading-relaxed">
          Your proposal has been successfully delivered. We are now awaiting the client's review.
        </p>
      </div>

      {/* Bottom Card: Waiting Status */}
      <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center relative overflow-hidden">
        {loadingStatus ? (
          <>
            <div className="w-20 h-20 bg-[#FFF5ED] rounded-full flex items-center justify-center text-[#FF7A1F] mb-8">
              <Loader2 className="animate-spin" size={36} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Checking customer response...</h2>
            <p className="text-gray-400 mb-12">
              Loading the latest booking status now.
            </p>
          </>
        ) : missingBooking ? (
          <>
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-8">
              <XCircle size={34} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No active waiting job</h2>
            <p className="text-gray-400 mb-12">
              Returning to the jobs list now.
            </p>
          </>
        ) : isRejected ? (
          <>
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-8">
              <XCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Customer did not accept the proposal</h2>
            <p className="text-gray-400 mb-12">
              The heading-to-customer page will stay locked until the customer accepts.
            </p>
          </>
        ) : isAccepted ? (
          <>
            <div className="w-20 h-20 bg-[#E7F9ED] rounded-full flex items-center justify-center text-[#22C55E] mb-8">
              <Check size={34} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Customer accepted your proposal</h2>
            <p className="text-gray-400 mb-12">
              Opening the heading-to-customer page now.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-[#FFF5ED] rounded-full flex items-center justify-center text-[#FF7A1F] mb-8">
              <div className="relative">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Waiting for Confirmation...</h2>
            <p className="text-gray-400 mb-12">
              Waiting for customer to confirm your proposal.
            </p>
          </>
        )}

        <div className="w-full border-t border-gray-50 pt-8 flex flex-col items-center">
          <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest mb-3">Estimated Wait</p>
          <div className="flex items-center gap-2 text-[#FF7A1F] font-bold text-xl">
            <Clock size={20} />
            <span>2-3 mins</span>
          </div>
        </div>
      </div>
    </div>
  );
}
