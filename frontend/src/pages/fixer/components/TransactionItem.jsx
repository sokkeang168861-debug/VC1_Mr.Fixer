import { User } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return dateFormatter.format(date);
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return timeFormatter.format(date);
}

const TransactionItem = ({
  bookingId,
  createdAt,
  userName,
  totalPaid,
  serviceFee,
  commission,
  netPayout,
  onViewReceipt,
}) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="px-4 py-3 transition-colors hover:bg-gray-50">
        <div className="grid grid-cols-7 items-center gap-4 text-sm">
          <div className="font-medium text-gray-900">
            #{bookingId}
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900">
              {formatDate(createdAt)}
            </div>
            <div className="text-xs text-gray-500">{formatTime(createdAt)}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
              <User className="h-3 w-3 text-gray-600" />
            </div>
            <span className="text-gray-700">{userName}</span>
          </div>

          <div>
            <div className="font-medium text-gray-900">
              {currencyFormatter.format(Number(totalPaid || 0))}
            </div>
            <div className="text-xs text-gray-500">
              Service fee: {currencyFormatter.format(Number(serviceFee || 0))}
            </div>
          </div>

          <div className="font-medium text-orange-600">
            {currencyFormatter.format(Number(commission || 0))}
          </div>

          <div className="font-semibold text-gray-900">
            {currencyFormatter.format(Number(netPayout || 0))}
          </div>

          <div>
            <button
              type="button"
              onClick={() => onViewReceipt?.(bookingId)}
              className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              View Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
