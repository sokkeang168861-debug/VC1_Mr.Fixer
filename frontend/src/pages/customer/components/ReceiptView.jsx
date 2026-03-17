import React, { useState } from 'react';
import {
  X,
  Download,
  Minus,
  Plus,
  RotateCcw,
  FileText,
  Calendar,
  Clock,
  CreditCard
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const ReceiptView = ({ onClose }) => {

  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob(["Simulated Receipt Content"], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "Invoice_FIX-882931.pdf";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col font-sans">

      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">

        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <X className="w-5 h-5" />
            <span>Close</span>
          </button>

          <span className="text-slate-900 font-bold text-sm hidden sm:block">
            Invoice_FIX-882931.pdf
          </span>
        </div>

        <div className="flex items-center gap-4">

          <div className="bg-slate-100 rounded-lg p-1 flex items-center gap-3 px-3">

            <button onClick={handleZoomOut}>
              <Minus className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold w-12 text-center">
              {zoom}%
            </span>

            <button onClick={handleZoomIn}>
              <Plus className="w-4 h-4" />
            </button>

            <button onClick={() => setZoom(100)}>
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

          <button
            onClick={handleDownload}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-10 flex justify-center">

        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out"
          }}
          className="w-full max-w-4xl"
        >

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-2xl rounded-sm overflow-hidden"
          >

            <div className="h-2 w-full bg-purple-600" />

            <div className="p-8 sm:p-16">

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-16">

                <div>
                  <div className="flex items-center gap-3 text-purple-600">
                    <FileText className="w-6 h-6" />
                    <h2 className="text-2xl font-black">
                      Receipt #FIX-882931
                    </h2>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      October 24, 2023
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      02:30 PM
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl">
                  <p className="text-xs text-purple-400 uppercase mb-2">
                    Service Performed
                  </p>
                  <h3 className="text-xl font-bold">AC Maintenance</h3>
                  <p className="text-xs text-slate-500">
                    Expert: John Doe
                  </p>
                </div>

              </div>

              {/* Billing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-16">

                <div>
                  <p className="text-xs text-slate-400 uppercase mb-4">
                    Billed To
                  </p>

                  <h4 className="text-lg font-bold mb-2">
                    Alex Johnson
                  </h4>

                  <div className="text-sm text-slate-500 space-y-1">
                    <p>123 Maple Street, Apt 4B</p>
                    <p>Oakwood, CA 90210</p>
                    <p>alex.j@example.com</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase mb-4">
                    Payment Method
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <h4 className="text-lg font-bold">
                      Visa ending in 1234
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400">
                    Transaction ID: TXN_90021884
                  </p>
                </div>

              </div>

              {/* Items */}
              <div className="space-y-6 mb-12">

                <div className="flex justify-between">
                  <span>Standard AC Maintenance Service</span>
                  <span>$120.00</span>
                </div>

                <div className="flex justify-between">
                  <span>Air Filter Replacement</span>
                  <span>$45.00</span>
                </div>

                <div className="flex justify-between">
                  <span>Distance Fee</span>
                  <span>$15.00</span>
                </div>

              </div>

              {/* Total */}
              <div className="border-t pt-6 flex flex-col items-end space-y-3">

                <div className="flex justify-between w-60">
                  <span>Subtotal</span>
                  <span>$180.00</span>
                </div>

                <div className="flex justify-between w-60">
                  <span>Tax (8%)</span>
                  <span>$11.52</span>
                </div>

                <div className="flex justify-between w-60 text-lg font-bold text-purple-600">
                  <span>Total Paid</span>
                  <span>$191.52</span>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="bg-purple-50 p-8 flex flex-col sm:flex-row justify-between items-center gap-6">

              <div className="text-xs text-slate-500 max-w-sm">
                Payment due within 30 days. Mr Fixer provides a 90-day warranty on all repairs.
              </div>

              <div className="text-sm font-bold">
                Thank you for your business!
              </div>

            </div>

          </Motion.div>

        </div>

      </div>

    </div>
  );
};

export default ReceiptView;
