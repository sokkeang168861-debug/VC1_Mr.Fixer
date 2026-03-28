import { resolveUploadUrl } from "./assets";

function isDirectUrl(value) {
  return /^(https?:)?\/\//.test(value) ||
    String(value || "").startsWith("data:") ||
    String(value || "").startsWith("blob:") ||
    String(value || "").startsWith("/");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

export function formatReceiptDate(value) {
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

export function formatStatusLabel(value, fallback = "Paid") {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getReceiptLineItems(receipt, fallbackName, fallbackAmount) {
  if (Array.isArray(receipt?.items) && receipt.items.length > 0) {
    return receipt.items;
  }

  return [
    {
      id: "summary",
      name: fallbackName || "Service",
      price: Number(fallbackAmount || 0),
    },
  ];
}

export function resolveReceiptImage(path) {
  if (!path) {
    return "";
  }

  return isDirectUrl(path) ? path : resolveUploadUrl(path);
}

export function buildReceiptSignature(name) {
  const compactName = String(name || "Mr. Fixer")
    .replace(/\s+/g, " ")
    .trim();

  return compactName || "Mr. Fixer";
}

export function buildPrintableReceiptHtml({ receipt, booking, payment }) {
  const orderId =
    receipt?.orderId ||
    `#BK-${String(booking?.id || "").padStart(5, "0")}`;
  const serviceName =
    receipt?.service ||
    booking?.category_name ||
    "Completed Service";
  const customerName =
    receipt?.customer?.name ||
    booking?.customer_name ||
    "Customer";
  const customerPhone =
    receipt?.customer?.phone ||
    booking?.customer_phone ||
    "N/A";
  const customerEmail =
    receipt?.customer?.email ||
    booking?.customer_email ||
    "N/A";
  const totalPaid =
    payment?.amount ??
    receipt?.amount ??
    booking?.service_fee ??
    0;
  const lineItems = getReceiptLineItems(receipt, serviceName, totalPaid);
  const serviceAddress =
    receipt?.serviceAddress ||
    booking?.service_address ||
    "N/A";
  const logoUrl = `${window.location.origin}/logo.png`;

  const receiptRows = lineItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item?.name || "Receipt item")}</td>
          <td class="amount">${escapeHtml(formatCurrency(item?.price))}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(`Receipt_${String(orderId).replace(/[^a-zA-Z0-9-]/g, "") || "booking"}`)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            background: #f8fafc;
            color: #111b4f;
            font-family: Arial, sans-serif;
          }
          .sheet {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 42px 42px 36px;
            box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
          }
          .header {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 300px;
            gap: 28px;
            align-items: start;
          }
          .title-wrap {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }
          .logo-box {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-box img {
            width: 62px;
            height: 62px;
            object-fit: contain;
          }
          .eyebrow {
            color: #7180b9;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.24em;
            text-transform: uppercase;
            margin: 0 0 8px;
          }
          .receipt-box {
            justify-self: end;
            width: 100%;
          }
          .receipt-number {
            width: 100%;
            border-collapse: collapse;
            background: #dfe5ff;
            border-radius: 0;
          }
          .receipt-number td {
            padding: 18px 22px;
            font-size: 22px;
            font-weight: 800;
          }
          .receipt-number td:first-child {
            width: 36%;
            text-align: center;
          }
          .receipt-number td:last-child {
            text-align: center;
          }
          .receipt-date {
            margin-top: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            justify-items: center;
            font-size: 16px;
            font-weight: 700;
          }
          .section-title {
            margin-top: 42px;
            background: #dfe5ff;
            padding: 16px 18px;
            font-size: 20px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .received-grid {
            display: grid;
            grid-template-columns: 240px minmax(0, 1fr);
            gap: 22px 34px;
            padding: 34px 8px 0;
            align-items: start;
          }
          .field-label {
            font-size: 18px;
            font-weight: 700;
          }
          .field-value {
            font-size: 18px;
            color: #3f4b7a;
            line-height: 1.45;
            word-break: break-word;
          }
          .order-bar {
            margin: 24px 0 10px;
            height: 18px;
            background: #f7efcf;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
          }
          .details-table th {
            padding: 16px 14px;
            background: #eef2ff;
            font-size: 16px;
            font-weight: 800;
            text-align: left;
          }
          .details-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #e4e9fb;
            vertical-align: top;
            font-size: 16px;
          }
          .details-table .amount {
            text-align: right;
            white-space: nowrap;
            font-size: 18px;
            color: #24336b;
          }
          .muted {
            color: #647099;
            font-size: 14px;
            margin-top: 6px;
            display: block;
          }
          .totals {
            margin-top: 32px;
            margin-left: auto;
            width: 390px;
            border-top: 1px solid #d9dff4;
            padding-top: 18px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 10px 0;
            color: #3f4b7a;
            font-size: 18px;
          }
          .total-row.final {
            color: #111b4f;
            font-size: 24px;
            font-weight: 800;
          }
          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .sheet {
              border-radius: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div>
              <div class="title-wrap">
                <div class="logo-box">
                  <img src="${escapeHtml(logoUrl)}" alt="Mr. Fixer logo" />
                </div>
                <div>
                  <p class="eyebrow">Official Receipt</p>
                </div>
              </div>
            </div>
            <div class="receipt-box">
              <table class="receipt-number">
                <tr>
                  <td>No</td>
                  <td>${escapeHtml(String(orderId).replace(/^#/, "R-"))}</td>
                </tr>
              </table>
              <div class="receipt-date">
                <span>Date</span>
                <span>${escapeHtml(
                  new Intl.DateTimeFormat("en-US").format(
                    new Date(payment?.paid_at || receipt?.date || booking?.created_at || Date.now())
                  )
                )}</span>
              </div>
            </div>
          </div>

          <div class="section-title">Received From</div>
          <div class="received-grid">
            <div class="field-label">Name</div>
            <div class="field-value">${escapeHtml(customerName)}</div>
            <div class="field-label">Phone Number</div>
            <div class="field-value">${escapeHtml(customerPhone)}</div>
            <div class="field-label">Email</div>
            <div class="field-value">${escapeHtml(customerEmail)}</div>
            <div class="field-label">Address</div>
            <div class="field-value">${escapeHtml(serviceAddress)}</div>
          </div>

          <div class="section-title">Order Details</div>
          <div class="order-bar"></div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${receiptRows}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row final">
              <span>Total</span>
              <span>${escapeHtml(formatCurrency(totalPaid))}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
