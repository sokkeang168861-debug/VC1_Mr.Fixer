import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Lock, Receipt } from 'lucide-react';

export default function ExpressCheckout() {
  const navigate = useNavigate();
  
  console.log('ExpressCheckout component loaded');

  const onComplete = () => {
    console.log('Payment complete - navigating to job-completed');
    navigate('/dashboard/fixer/jobs/job-completed');
  };
  
  useEffect(() => {
    console.log('ExpressCheckout useEffect - setting up timer');
    const timer = setTimeout(() => {
      console.log('ExpressCheckout timer triggered - navigating to job-completed');
      navigate('/dashboard/fixer/jobs/job-completed');
    }, 10000); // Auto-redirect after 10 seconds
    return () => {
      console.log('ExpressCheckout cleanup - clearing timer');
      clearTimeout(timer);
    };
  }, [navigate]);
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
                src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=https://mrfixer.app/pay/FIX-8892-XP" 
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
              <p className="text-sm font-bold text-gray-700">Order ID: <span className="text-gray-400">#FIX-8892-XP</span></p>
            </div>
            <p className="text-lg font-bold text-gray-800">$124.50</p>
          </div>

          {/* Action Button */}
          <div className="w-full max-w-md space-y-6">
            <button 
              onClick={onComplete}
              className="w-full bg-[#FF7A1F] hover:bg-[#E66D1C] text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-[#FF7A1F]/20 text-lg"
            >
              Receive payment
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
