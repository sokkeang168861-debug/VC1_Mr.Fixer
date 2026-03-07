const Admin = require("../models/adminModel");

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
