import { useState } from "react";
import {
  X,
  Download,
  Minus,
  Plus,
  RotateCcw,
  FileText,
  Calendar,
  CreditCard,
  User,
  Hash,
} from "lucide-react";
import { motion as Motion } from "motion/react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

const ReceiptView = ({ onClose, receipt }) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const fileName = `Receipt_${receipt?.orderId?.replace(/[^a-zA-Z0-9-]/g, "") || "booking"}.txt`;

  const handleDownload = () => {
    const content = [
      `Receipt: ${receipt?.orderId || "N/A"}`,
      `Service: ${receipt?.service || "N/A"}`,
      `Service ID: ${receipt?.serviceId ?? "N/A"}`,
      `Fixer: ${receipt?.fixer?.name || "N/A"}`,
      `Date: ${receipt?.date || "N/A"}`,
      `Amount: ${formatCurrency(receipt?.amount)}`,
      `Status: ${receipt?.status || "Completed"}`,
    ].join("\n");

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 font-sans">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
            <span>Close</span>
          </button>

          <span className="hidden text-sm font-bold text-slate-900 sm:block">
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 p-1">
            <button onClick={handleZoomOut}>
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-12 text-center text-xs font-bold">{zoom}%</span>

            <button onClick={handleZoomIn}>
              <Plus className="h-4 w-4" />
            </button>

            <button onClick={() => setZoom(100)}>
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      <div className="flex flex-1 justify-center overflow-auto p-4 sm:p-10">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out",
          }}
          className="w-full max-w-3xl"
        >
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-sm bg-white shadow-2xl"
          >
            <div className="h-2 w-full bg-purple-600" />

            <div className="p-8 sm:p-16">
              <div className="mb-12 flex flex-col items-start justify-between gap-8 sm:flex-row">
                <div>
                  <div className="flex items-center gap-3 text-purple-600">
                    <FileText className="h-6 w-6" />
                    <h2 className="text-2xl font-black">
                      Receipt {receipt?.orderId || ""}
                    </h2>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {receipt?.date || "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Booking ID: {receipt?.bookingId ?? "N/A"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
                  <p className="mb-2 text-xs uppercase text-purple-400">
                    Service Performed
                  </p>
                  <h3 className="text-xl font-bold">
                    {receipt?.service || "N/A"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Service ID: {receipt?.serviceId ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="mb-12 grid grid-cols-1 gap-12 sm:grid-cols-2">
                <div>
                  <p className="mb-4 text-xs uppercase text-slate-400">Fixer</p>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">
                        {receipt?.fixer?.name || "N/A"}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Status: {receipt?.status || "Completed"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-xs uppercase text-slate-400">
                    Payment Summary
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <h4 className="text-lg font-bold">Recorded Payment</h4>
                  </div>

                  <p className="text-xs text-slate-400">
                    Amount sourced from the payments table.
                  </p>
                </div>
              </div>

              <div className="mb-12 space-y-6">
                <div className="flex justify-between">
                  <span>{receipt?.service || "Service"}</span>
                  <span>{formatCurrency(receipt?.amount)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3 border-t pt-6">
                <div className="flex w-60 justify-between text-lg font-bold text-purple-600">
                  <span>Total Paid</span>
                  <span>{formatCurrency(receipt?.amount)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 bg-purple-50 p-8 text-center sm:flex-row sm:text-left">
              <div className="max-w-sm text-xs text-slate-500">
                This receipt summarizes the completed booking currently shown in
                your service history.
              </div>

              <div className="text-sm font-bold">Thank you for your business!</div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
