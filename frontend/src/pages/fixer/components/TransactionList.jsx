import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions = [], loading = false }) => {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-sm text-gray-500">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="grid grid-cols-6 items-center gap-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <div>Job ID</div>
          <div>Date & Time</div>
          <div>User</div>
          <div>Total Paid</div>
          <div>Commission</div>
          <div>Net Payout</div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem
              key={transaction.booking_id}
              bookingId={transaction.booking_id}
              createdAt={transaction.created_at}
              userName={transaction.full_name}
              totalPaid={transaction.amount_paid}
              serviceFee={transaction.service_fee}
              commission={transaction.commission}
              netPayout={transaction.net_payout}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-sm text-gray-500">
            No transactions found yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
