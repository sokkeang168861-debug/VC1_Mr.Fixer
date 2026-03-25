const AdminModel = require("../models/adminModel");
const COMMISSION_RATE = 0.1;

function roundMoney(value) {
  return Number((Number(value || 0) + Number.EPSILON).toFixed(2));
}

function normalizeSearch(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/^#?job[-\s]*/i, "");
}

function normalizeMonth(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw { status: 400, message: "Month must be between 1 and 12" };
  }

  return month;
}

function normalizeYear(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const year = Number(value);

  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw { status: 400, message: "Year must be a valid 4-digit number" };
  }

  return year;
}

function formatStatusLabel(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (!normalized) {
    return "Unknown";
  }

  if (normalized === "complete") {
    return "Completed";
  }

  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

class AdminService {
  static async getTransactionLedger(db, user, filters = {}) {
    const role = String(user?.role || "").toLowerCase();

    if (!user?.id) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "admin") {
      throw { status: 403, message: "Only admin accounts can access this resource" };
    }

    const normalizedFilters = {
      search: normalizeSearch(filters.search),
      month: normalizeMonth(filters.month),
      year: normalizeYear(filters.year),
    };

    const rows = await AdminModel.getTransactionLedger(db, normalizedFilters);

    const transactions = rows.map((row) => {
      const totalPaid = roundMoney(row.amount_paid);
      const commission = roundMoney(totalPaid * COMMISSION_RATE);
      const netPayout = roundMoney(totalPaid - commission);

      return {
        booking_id: Number(row.booking_id),
        created_at: row.created_at,
        paid_at: row.latest_paid_at,
        customer_name: row.customer_name || "Unknown User",
        fixer_name:
          row.fixer_name || row.fixer_company_name || "Unknown Fixer",
        fixer_company_name: row.fixer_company_name || "",
        total_paid: totalPaid,
        commission,
        net_payout: netPayout,
        status: String(row.booking_status || "").toLowerCase(),
        status_label: formatStatusLabel(row.booking_status),
      };
    });

    const summary = transactions.reduce(
      (accumulator, transaction) => ({
        totalJobs: accumulator.totalJobs + 1,
        totalPaid: roundMoney(accumulator.totalPaid + transaction.total_paid),
        totalCommission: roundMoney(
          accumulator.totalCommission + transaction.commission
        ),
        totalNetPayout: roundMoney(
          accumulator.totalNetPayout + transaction.net_payout
        ),
      }),
      {
        totalJobs: 0,
        totalPaid: 0,
        totalCommission: 0,
        totalNetPayout: 0,
      }
    );

    return {
      filters: normalizedFilters,
      summary,
      commissionRate: COMMISSION_RATE,
      transactions,
    };
  }
}

module.exports = AdminService;
