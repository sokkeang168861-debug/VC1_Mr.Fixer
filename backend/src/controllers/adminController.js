const Admin = require("../models/adminModel");
const AdminService = require("../services/adminService");

// GET /api/admin/stats
exports.getUserStats = async (req, res) => {
  const db = req.app.get("db");
  const year = Number(req.query.year) || new Date().getFullYear();

  try {
    const stats = await Admin.getUserStats(db, { year });

    res.status(200).json({
      success: true,
      data: {
        totalUsers: stats.totalUsers,
        totalFixers: stats.totalFixers,
        totalCustomers: stats.totalCustomers,
        totalJobs: stats.totalJobs,
        monthlyJobs: stats.monthlyJobs,
        year: stats.year,
      },
    });
  } catch (error) {
    console.error("Failed to get admin stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTransactionLedger = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await AdminService.getTransactionLedger(
      db,
      req.user,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to get admin transactions:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
