import { useState } from "react";
import { X, Download, Minus, Plus, RotateCcw } from "lucide-react";
import { motion as Motion } from "motion/react";

import {
  buildPrintableReceiptHtml,
  formatCurrency,
  formatReceiptDate,
  getReceiptLineItems,
} from "@/lib/receipt";

const ReceiptView = ({ onClose, receipt, loading = false }) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const fileName = `Receipt_${receipt?.orderId?.replace(/[^a-zA-Z0-9-]/g, "") || "booking"}.pdf`;
  const serviceName = receipt?.service || "Completed Service";
  const customerName = receipt?.customer?.name || "Customer";
  const customerPhone = receipt?.customer?.phone || "N/A";
  const customerEmail = receipt?.customer?.email || "N/A";
  const lineItems = getReceiptLineItems(receipt, serviceName, receipt?.amount);
  const amountPaid =
    receipt?.amount ??
    lineItems.reduce((sum, item) => sum + Number(item?.price || 0), 0);
  const logoUrl = `${window.location.origin}/logo.png`;
  const receiptNumber = String(receipt?.orderId || "")
    .replace(/^#/, "R-") || "R-00000";
  const receiptDate = formatReceiptDate(receipt?.date);
  const serviceAddress = receipt?.serviceAddress || "N/A";

  const handleDownload = () => {
    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      window.alert("Please allow pop-ups to save the receipt as PDF.");
      return;
    }

    printWindow.document.write(
      buildPrintableReceiptHtml({
        receipt,
      })
    );
    printWindow.document.close();
    printWindow.document.title = fileName;
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 font-sans">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            type="button"
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
            <button type="button" onClick={handleZoomOut}>
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-12 text-center text-xs font-bold">{zoom}%</span>

            <button type="button" onClick={handleZoomIn}>
              <Plus className="h-4 w-4" />
            </button>

            <button type="button" onClick={() => setZoom(100)}>
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Download className="h-4 w-4" />
            Download PDF
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
          className="w-full max-w-[920px]"
        >
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-8 text-[#111b4f] shadow-2xl sm:p-12"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="flex items-start gap-4">
                <img
                  src={logoUrl}
                  alt="Mr. Fixer"
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7180b9]">
                    Official Receipt
                  </p>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-[110px_1fr] bg-[#dfe5ff] text-center text-2xl font-black">
                  <div className="px-5 py-4">No</div>
                  <div className="px-5 py-4">{receiptNumber}</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-center text-lg font-bold">
                  <div>Date</div>
                  <div>{receiptDate}</div>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-[#dfe5ff] px-4 py-4 text-2xl font-black uppercase">
              Received From
            </div>

            <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-x-8 gap-y-5 px-2 py-8 text-lg sm:grid-cols-[240px_minmax(0,1fr)]">
              <div className="font-bold">Name</div>
              <div className="text-[#3f4b7a]">{customerName}</div>
              <div className="font-bold">Phone Number</div>
              <div className="text-[#3f4b7a]">{customerPhone}</div>
              <div className="font-bold">Email</div>
              <div className="text-[#3f4b7a]">{customerEmail}</div>
              <div className="font-bold">Address</div>
              <div className="text-[#3f4b7a] leading-8">{serviceAddress}</div>
            </div>

            <div className="bg-[#dfe5ff] px-4 py-4 text-2xl font-black uppercase">
              Order Details
            </div>
            <div className="mt-6 h-4 bg-[#f7efcf]" />

            <div className="mt-8 overflow-hidden border border-[#e4e9fb]">
              <div className="grid grid-cols-[1fr_160px] bg-[#eef2ff] px-4 py-4 text-xl font-black">
                <div>Description</div>
                <div className="text-right">Amount</div>
              </div>

              {loading ? (
                <div className="px-4 py-10 text-center text-base text-[#647099]">
                  Loading receipt items...
                </div>
              ) : (
                lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_160px] border-t border-[#e4e9fb] px-4 py-5"
                  >
                    <div>
                      <div className="text-xl font-semibold text-[#24336b]">
                        {item.name}
                      </div>
                      <span className="mt-2 block text-sm text-[#647099]">
                        Service item
                      </span>
                    </div>
                    <div className="text-right text-2xl text-[#24336b]">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="ml-auto mt-8 w-full max-w-[390px] border-t border-[#d9dff4] pt-4">
              <div className="flex items-center justify-between py-2 text-[2rem] font-black">
                <span>Total</span>
                <span>{formatCurrency(amountPaid)}</span>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
