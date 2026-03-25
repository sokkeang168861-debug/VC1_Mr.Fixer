import { TrendingUp, Wallet, Percent, PiggyBank } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default function SummaryCards({
  summary = {},
  loading = false,
}) {
  const totalPaid = Number(summary.totalPaid || 0);
  const totalCommission = Number(summary.totalCommission || 0);
  const totalNetPayout = Number(summary.totalNetPayout || 0);
  const totalTransactions = Number(summary.totalTransactions || 0);

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            {totalTransactions.toLocaleString("en-US")} Jobs
          </div>
        </div>
        <h3 className="mb-1 text-sm text-gray-600">Total Paid</h3>
        <p className="text-2xl font-bold">
          {loading ? "Loading..." : currencyFormatter.format(totalPaid)}
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
            <Percent className="h-6 w-6 text-white" />
          </div>
          <span className="rounded bg-gray-100 px-2 py-1 text-xs">
            10% Rate
          </span>
        </div>
        <h3 className="mb-1 text-sm text-gray-600">Total Commission</h3>
        <p className="text-2xl font-bold">
          {loading ? "Loading..." : currencyFormatter.format(totalCommission)}
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
            <PiggyBank className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            After Commission
          </div>
        </div>
        <h3 className="mb-1 text-sm text-gray-600">Net Payout</h3>
        <p className="text-2xl font-bold">
          {loading ? "Loading..." : currencyFormatter.format(totalNetPayout)}
        </p>
      </div>
    </section>
  );
}
