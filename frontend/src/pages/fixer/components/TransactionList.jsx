import React from 'react';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions = [] }) => {
  const defaultTransactions = [
    {
      id: '1',
      jobId: '240311-001',
      date: 'Mar 11, 2024',
      time: '10:30 AM',
      userName: 'Sarah Jenkins',
      totalPaid: '150.00',
      commission: '20',
      netPayout: '120.00'
    },
    {
      id: '2',
      jobId: '240311-002',
      date: 'Mar 11, 2024',
      time: '2:15 PM',
      userName: 'David Chen',
      totalPaid: '280.50',
      commission: '15',
      netPayout: '238.43'
    },
    {
      id: '3',
      jobId: '240312-001',
      date: 'Mar 12, 2024',
      time: '9:45 AM',
      userName: 'Emma Watson',
      totalPaid: '95.00',
      commission: '25',
      netPayout: '71.25'
    },
    {
      id: '4',
      jobId: '240312-002',
      date: 'Mar 12, 2024',
      time: '3:20 PM',
      userName: 'Marcus T.',
      totalPaid: '420.00',
      commission: '18',
      netPayout: '344.40'
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : defaultTransactions;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-6 gap-4 items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Job ID</div>
          <div>Date & Time</div>
          <div>User</div>
          <div>Total Paid</div>
          <div>Commission</div>
          <div>Net Payout</div>
        </div>
      </div>
      
      {/* Transaction Items */}
      <div className="divide-y divide-gray-100">
        {displayTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            jobId={transaction.jobId}
            date={transaction.date}
            time={transaction.time}
            userName={transaction.userName}
            totalPaid={transaction.totalPaid}
            commission={transaction.commission}
            netPayout={transaction.netPayout}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
