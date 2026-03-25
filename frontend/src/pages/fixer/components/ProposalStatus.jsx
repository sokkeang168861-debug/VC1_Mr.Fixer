import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Clock } from 'lucide-react';
import { createAppSocket } from "@/lib/socket";

export default function ProposalStatus() {
  const navigate = useNavigate();
  const { id: bookingId } = useParams();
  
  useEffect(() => {
    const socket = createAppSocket();

    // Listen for booking updates
    socket.on("booking:updated", (booking) => {
      console.log("Booking updated received in ProposalStatus:", booking);
      
      // Ensure we only act on the booking we are waiting for
      if (String(booking.id) === String(bookingId)) {
        if (booking.status === "customer_accept") {
          navigate('/dashboard/fixer/jobs/heading-to-customer');
        } else if (booking.status === "customer_reject") {
          navigate('/dashboard/fixer/jobs/proposal-rejected');
        }
      }
    });

    // Also listen for general booking updates if they use different event names
    socket.on("booking_confirmed", (booking) => {
      if (String(booking.id) === String(bookingId)) {
        navigate('/dashboard/fixer/jobs/heading-to-customer');
      }
    });

    socket.on("booking_rejected", (booking) => {
      if (String(booking.id) === String(bookingId)) {
        navigate('/dashboard/fixer/jobs/proposal-rejected');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate, bookingId]);

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
          Waiting for customer to confirm you proposal.
        </p>

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
