const FixerProfitModel = require("../models/fixerProfitModel");

const COMMISSION_RATE = 0.1;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function roundMoney(value) {
  return Number((Number(value || 0) + Number.EPSILON).toFixed(2));
}

class FixerProfitService {
  static async getProfitData(db, user) {
    const fixerUserId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!fixerUserId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "fixer") {
      throw {
        status: 403,
        message: "Only fixer accounts can access this resource",
      };
    }

    const rows = await FixerProfitModel.getTransactionsByFixerUserId(
      db,
      fixerUserId
    );

    const transactions = rows.map((row) => {
      const serviceFee = roundMoney(row.service_fee);
      const amountPaid = roundMoney(row.amount_paid);
      const commission = roundMoney(amountPaid * COMMISSION_RATE);
      const netPayout = roundMoney(amountPaid - commission);

      return {
        booking_id: Number(row.booking_id),
        service_fee: serviceFee,
        amount_paid: amountPaid,
        commission,
        net_payout: netPayout,
        full_name: row.full_name || "Unknown Customer",
        created_at: row.created_at,
      };
    });

    const summary = transactions.reduce(
      (accumulator, transaction) => ({
        totalTransactions: accumulator.totalTransactions + 1,
        totalServiceFee: roundMoney(
          accumulator.totalServiceFee + transaction.service_fee
        ),
        totalPaid: roundMoney(accumulator.totalPaid + transaction.amount_paid),
        totalCommission: roundMoney(
          accumulator.totalCommission + transaction.commission
        ),
        totalNetPayout: roundMoney(
          accumulator.totalNetPayout + transaction.net_payout
        ),
      }),
      {
        totalTransactions: 0,
        totalServiceFee: 0,
        totalPaid: 0,
        totalCommission: 0,
        totalNetPayout: 0,
      }
    );

    const monthlySummaryMap = new Map();

    transactions.forEach((transaction) => {
      const date = transaction.created_at ? new Date(transaction.created_at) : null;

      if (!date || Number.isNaN(date.getTime())) {
        return;
      }

      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
      const existing = monthlySummaryMap.get(key) || {
        year,
        monthIndex,
        month: MONTH_NAMES[monthIndex],
        totalPaid: 0,
        totalCommission: 0,
        totalNetPayout: 0,
        totalServiceFee: 0,
        totalTransactions: 0,
      };

      existing.totalPaid = roundMoney(existing.totalPaid + transaction.amount_paid);
      existing.totalCommission = roundMoney(
        existing.totalCommission + transaction.commission
      );
      existing.totalNetPayout = roundMoney(
        existing.totalNetPayout + transaction.net_payout
      );
      existing.totalServiceFee = roundMoney(
        existing.totalServiceFee + transaction.service_fee
      );
      existing.totalTransactions += 1;

      monthlySummaryMap.set(key, existing);
    });

    const monthlySummary = Array.from(monthlySummaryMap.values())
      .sort((left, right) => {
        if (left.year !== right.year) {
          return right.year - left.year;
        }

        return right.monthIndex - left.monthIndex;
      })
      .map((item) => ({
        year: item.year,
        month: item.month,
        total_paid: item.totalPaid,
        commission: item.totalCommission,
        net_payout: item.totalNetPayout,
        service_fee: item.totalServiceFee,
        total_transactions: item.totalTransactions,
      }));

    return {
      summary: {
        ...summary,
        commissionRate: COMMISSION_RATE,
      },
      transactions,
      monthlySummary,
    };
  }
}

module.exports = FixerProfitService;
