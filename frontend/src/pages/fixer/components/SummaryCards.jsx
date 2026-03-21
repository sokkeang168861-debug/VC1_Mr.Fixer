import { TrendingUp, Wallet, Percent, PiggyBank } from 'lucide-react';

export default function SummaryCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12.5%
          </div>
        </div>
        <h3 className="text-gray-600 text-sm mb-1">Total Profit</h3>
        <p className="text-2xl font-bold">$45,280.00</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Percent className="w-6 h-6 text-white" />
          </div>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            Standard
          </span>
        </div>
        <h3 className="text-gray-600 text-sm mb-1">Total Commission</h3>
        <p className="text-2xl font-bold">$6,792.00</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            +8.2%
          </div>
        </div>
        <h3 className="text-gray-600 text-sm mb-1">Net Profit</h3>
        <p className="text-2xl font-bold">$38,488.00</p>
      </div>

    </section>
  );
}
