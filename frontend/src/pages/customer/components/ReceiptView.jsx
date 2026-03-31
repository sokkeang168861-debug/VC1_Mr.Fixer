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
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { motion as Motion } from "motion/react";

const COMMISSION_RATE = 0.1;

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function formatReceiptDate(value) {
  if (!value) {
    return "N/A";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

const ReceiptView = ({ onClose, receipt, loading = false }) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const orderId = receipt?.orderId || `#BK-${String(receipt?.bookingId || "").padStart(5, "0")}`;
  const serviceName = receipt?.service || "Completed Service";
  const fixerName = receipt?.fixer?.name || "Assigned Fixer";
  const fixerEmail =
    receipt?.fixer?.email || receipt?.fixer_email || "Not available";
  const fixerPhone =
    receipt?.fixer?.phone || receipt?.fixer_phone || "Not available";
  const fixerAddress =
    receipt?.fixer?.address ||
    receipt?.fixer_address ||
    receipt?.address ||
    "Not available";
  const customerName =
    receipt?.customer?.name || receipt?.customer_name || "Customer";
  const customerEmail =
    receipt?.customer?.email || receipt?.customer_email || "Not available";
  const customerPhone =
    receipt?.customer?.phone || receipt?.customer_phone || "Not available";
  const receiptDate = formatReceiptDate(receipt?.date || receipt?.createdAt);
  const paymentStatus = String(receipt?.status || "Completed").toUpperCase();
  const lineItems = Array.isArray(receipt?.items) ? receipt.items : [];
  const subtotal = lineItems.reduce(
    (sum, item) => sum + Number(item?.price || 0),
    0
  );
  const totalPaid = receipt?.amount ?? receipt?.receiptTotal ?? subtotal;
  const commissionAmount = Number((subtotal * COMMISSION_RATE).toFixed(2));
  const commissionLabel = `Commission (${(
    COMMISSION_RATE * 100
  ).toFixed(0)}%)`;
  const fileName = `Receipt_${orderId.replace(/[^a-zA-Z0-9-]/g, "") || "booking"}.pdf`;

  const handleDownload = () => {
    const receiptRows =
      lineItems.length > 0
        ? lineItems
            .map(
              (item, index) => `
                <tr>
                  <td>${index + 1}. ${item?.name || `Item ${index + 1}`}</td>
                  <td style="text-align:right;">${formatCurrency(item?.price)}</td>
                </tr>
              `
            )
            .join("")
        : `
            <tr>
              <td colspan="2" style="color:#64748b;">No receipt items found for this booking.</td>
            </tr>
          `;

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      window.alert("Please allow pop-ups to download the receipt as PDF.");
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${fileName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 32px;
              background: #ffffff;
            }
            .sheet {
              max-width: 820px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              overflow: hidden;
            }
            .topbar {
              height: 8px;
              background: #7c3aed;
            }
            .content {
              padding: 32px;
            }
            .brand {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 24px;
              padding-bottom: 24px;
              border-bottom: 1px solid #e2e8f0;
            }
            .brand-left {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .logo {
              width: 56px;
              height: 56px;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              object-fit: contain;
              padding: 8px;
              background: #fff;
            }
            .eyebrow {
              color: #7c3aed;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.25em;
              text-transform: uppercase;
            }
            h1 {
              margin: 12px 0 4px;
              font-size: 38px;
            }
            .muted {
              color: #64748b;
              font-size: 14px;
            }
            .summary {
              margin-top: 28px;
              display: grid;
              grid-template-columns: 1fr 280px;
              gap: 24px;
            }
            .summary-card {
              border: 1px solid #e9d5ff;
              background: #faf5ff;
              border-radius: 20px;
              padding: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              margin: 10px 0;
              font-size: 15px;
            }
            .info-grid {
              margin-top: 28px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
            }
            .info-card {
              border: 1px solid #e2e8f0;
              border-radius: 20px;
              padding: 20px;
            }
            .section-label {
              color: #94a3b8;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            .contact-line {
              margin: 8px 0;
              color: #475569;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 28px;
            }
            th, td {
              padding: 14px 0;
              border-bottom: 1px solid #e2e8f0;
              font-size: 15px;
            }
            th {
              color: #94a3b8;
              font-size: 12px;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              text-align: left;
            }
            .totals {
              margin-top: 24px;
              margin-left: auto;
              max-width: 320px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              color: #64748b;
            }
            .total-row.final {
              color: #7c3aed;
              font-size: 28px;
              font-weight: 700;
            }
            .footer {
              margin-top: 32px;
              padding: 24px 32px;
              background: #faf5ff;
              display: flex;
              justify-content: space-between;
              gap: 24px;
              align-items: center;
            }
            @media print {
              body {
                padding: 0;
              }
              .sheet {
                border: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="topbar"></div>
            <div class="content">
              <div class="brand">
                <div class="brand-left">
                  <img src="${window.location.origin}/logo.png" alt="Mr. Fixer logo" class="logo" />
                  <div>
                    <div style="font-size:20px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;">Mr. Fixer</div>
                    <div class="muted">Home service receipt and payment record</div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <div class="eyebrow">Official Receipt</div>
                  <h1>Receipt ${orderId}</h1>
                  <div class="muted">${receiptDate}</div>
                </div>
              </div>

              <div class="summary">
                <div>
                  <div class="summary-row"><span>Service</span><strong>${serviceName}</strong></div>
                  <div class="summary-row"><span>Booking ID</span><strong>${receipt?.bookingId ?? "N/A"}</strong></div>
                  <div class="summary-row"><span>Service ID</span><strong>${receipt?.serviceId ?? "N/A"}</strong></div>
                </div>
                <div class="summary-card">
                  <div class="section-label">Payment Summary</div>
                  <div class="summary-row"><span>Status</span><strong>${paymentStatus}</strong></div>
                  <div class="summary-row"><span>Items</span><strong>${lineItems.length}</strong></div>
                  <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
                  <div class="summary-row"><span>${commissionLabel}</span><strong>${formatCurrency(commissionAmount)}</strong></div>
                  <div class="summary-row" style="padding-top:10px;border-top:1px solid #e9d5ff;"><span>Total Paid</span><strong>${formatCurrency(totalPaid)}</strong></div>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-card">
                  <div class="section-label">Service Provider</div>
                  <div style="font-size:22px;font-weight:700;">${fixerName}</div>
                  <div class="muted">${serviceName}</div>
                  <div class="contact-line">Email: ${fixerEmail}</div>
                  <div class="contact-line">Phone: ${fixerPhone}</div>
                  <div class="contact-line">Address: ${fixerAddress}</div>
                </div>
                <div class="info-card">
                  <div class="section-label">Bill To</div>
                  <div style="font-size:22px;font-weight:700;">${customerName}</div>
                  <div class="muted">Customer Payment</div>
                  <div class="contact-line">Email: ${customerEmail}</div>
                  <div class="contact-line">Phone: ${customerPhone}</div>
                  <div class="contact-line">Status: ${paymentStatus}</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${receiptRows}
                </tbody>
              </table>

              <div class="totals">
                <div class="total-row">
                  <span>Subtotal (before commission)</span>
                  <span>${formatCurrency(subtotal)}</span>
                </div>
                <div class="total-row">
                  <span>${commissionLabel}</span>
                  <span>${formatCurrency(commissionAmount)}</span>
                </div>
                <div class="total-row final">
                  <span>Total Paid</span>
                  <span>${formatCurrency(totalPaid)}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <div class="muted">This receipt confirms payment for the completed booking and can be used as a service payment record.</div>
              <div style="font-weight:700;">Thank you for your business!</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
              <div className="mb-8 flex flex-col gap-5 border-b border-slate-100 pb-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src="/logo.png"
                    alt="Mr. Fixer logo"
                    className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-contain p-2"
                  />
                  <div>
                    <p className="text-lg font-black uppercase tracking-[0.2em] text-slate-900">
                      Mr. Fixer
                    </p>
                    <p className="text-sm text-slate-500">
                      Home service receipt and payment record
                    </p>
                  </div>
                </div>

                <div className="text-sm text-slate-500 sm:text-right">
                  <p className="font-semibold text-slate-900">Receipt Record</p>
                  <p>{receiptDate}</p>
                </div>
              </div>

              <div className="mb-10 flex flex-col items-start justify-between gap-8 border-b border-slate-100 pb-10 sm:flex-row">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-600">
                    Official Receipt
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-slate-900">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <h2 className="text-3xl font-black sm:text-4xl">
                      Receipt {orderId}
                    </h2>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {receiptDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Booking ID: {receipt?.bookingId ?? "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Service ID: {receipt?.serviceId ?? "N/A"}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-xs rounded-2xl border border-purple-100 bg-purple-50 p-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
                    Payment Summary
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Status</span>
                      <span className="font-bold text-purple-700">
                        {paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Items</span>
                      <span className="font-bold text-slate-900">
                        {lineItems.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Subtotal (before commission)</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">{commissionLabel}</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(commissionAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-purple-100 pt-3">
                      <span className="text-slate-500">Total Paid</span>
                      <span className="text-xl font-black text-slate-900">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Service Provider
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {fixerName}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {serviceName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex items-start gap-3 text-slate-600">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span className="break-all">{fixerEmail}</span>
                      </div>
                      <div className="flex items-start gap-3 text-slate-600">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span>{fixerPhone}</span>
                      </div>
                      <div className="flex items-start gap-3 text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span>{fixerAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Bill To
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <h4 className="text-lg font-bold text-slate-900">
                        Customer Payment
                      </h4>
                    </div>
                    <p className="text-sm text-slate-500">
                      Payment for completed repair service.
                    </p>
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex items-start gap-3 text-slate-600">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span>{customerName}</span>
                      </div>
                      <div className="flex items-start gap-3 text-slate-600">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span className="break-all">{customerEmail}</span>
                      </div>
                      <div className="flex items-start gap-3 text-slate-600">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span>{customerPhone}</span>
                      </div>
                      <p className="pt-1 text-sm font-medium text-slate-700">
                        Status: {paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Charges
                </p>
                <div className="space-y-4">
                  {loading ? (
                    <div className="border-b border-slate-200 pb-4 text-sm text-slate-500">
                      Loading receipt items...
                    </div>
                  ) : lineItems.length > 0 ? (
                    lineItems.map((item, index) => (
                      <div
                        key={item?.id || `${item?.name || "item"}-${index}`}
                        className="flex items-start justify-between gap-6 border-b border-slate-200 pb-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {index + 1}. {item?.name || `Item ${index + 1}`}
                          </p>
                        </div>
                        <div className="shrink-0 text-right font-semibold text-slate-900">
                          {formatCurrency(item?.price)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-b border-slate-200 pb-4 text-sm text-slate-500">
                      No receipt items found in the receipt table for this booking.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 border-t border-slate-200 pt-6">
                <div className="flex w-full max-w-xs justify-between text-sm text-slate-500">
                  <span>Subtotal (before commission)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex w-full max-w-xs justify-between text-sm text-slate-500">
                  <span>{commissionLabel}</span>
                  <span>{formatCurrency(commissionAmount)}</span>
                </div>
                <div className="flex w-full max-w-xs justify-between text-lg font-bold text-purple-600">
                  <span>Total Paid</span>
                  <span>{formatCurrency(totalPaid)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 bg-purple-50 p-8 text-center sm:flex-row sm:text-left">
              <div className="max-w-sm text-xs text-slate-500">
                This receipt confirms payment for the completed booking and can
                be used as a service payment record.
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
