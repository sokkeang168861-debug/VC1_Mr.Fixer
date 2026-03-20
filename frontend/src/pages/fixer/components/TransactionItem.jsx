import React from 'react';
import { User } from 'lucide-react';

const TransactionItem = ({
  jobId,
  date,
  time,
  userName,
  totalPaid,
  commission,
  netPayout
}) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="grid grid-cols-6 gap-4 items-center text-sm">
          {/* Job ID */}
          <div className="font-medium text-gray-900">
            #{jobId}
          </div>
          
          {/* Date & Time */}
          <div>
            <div className="text-sm font-semibold text-gray-900">{date}</div>
            <div className="text-xs text-gray-500">{time}</div>
          </div>
          
          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-600" />
            </div>
            <span className="text-gray-700">{userName}</span>
          </div>
          
          {/* Total Paid */}
          <div className="font-medium text-gray-900">
            ${totalPaid}
          </div>
          
          {/* Commission */}
          <div className="text-gray-600">
            {commission}%
          </div>
          
          {/* Net Payout */}
          <div className="font-semibold text-gray-900">
            ${netPayout}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
