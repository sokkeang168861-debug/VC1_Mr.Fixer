const FixerDashboardModel = require("../models/fixerDashboardModel");

class FixerDashboardController {
  async getSummaryCards(req, res) {
    const db = req.app.get("db");

    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({
          message: "User not found in request",
        });
      }

      const [completedJobs, totalProfit] = await Promise.all([
        FixerDashboardModel.getCompletedJobsCount(db, userId),
        FixerDashboardModel.getTotalProfit(db, userId),
      ]);
      const commission = 0.1 * totalProfit;
      const netProfit = 0.9 * totalProfit;

      return res.status(200).json({
        message: "Get successfully",
        data: {
          completedJobs,
          totalProfit,
          commission,
          netProfit,
        },
      });

    } catch (err) {
      return res.status(err.status || 500).json({
        message: err.message || "Failed to get summary cards",
      });
    }
  }

}

module.exports = new FixerDashboardController();
// const getHomepageData = async (req, res) => {
//   const db = req.app.get("db");
//   const fixerId = req.user?.id;
//   const role = req.user?.role;
//   const feedbackLimit = Number(req.query.limit) || 5;

//   if (!fixerId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   if (role !== "fixer") {
//     return res.status(403).json({ message: "Only fixer accounts can access this resource" });
//   }

//   try {
//     const [summary, feedback] = await Promise.all([
//       FixerDashboardModel.getRatingSummary(db, fixerId),
//       FixerDashboardModel.getRecentFeedback(db, fixerId, feedbackLimit),
//     ]);

//     const detailedRatings = [
//       {
//         key: "quality_of_work",
//         label: "Quality of Work",
//         value: Number(summary.quality_rating),
//         outOf: 5,
//       },
//       {
//         key: "speed_of_service",
//         label: "Speed of Service",
//         value: Number(summary.speed_rating),
//         outOf: 5,
//       },
//       {
//         key: "price_fairness",
//         label: "Price Fairness",
//         value: Number(summary.price_fairness_rating),
//         outOf: 5,
//       },
//       {
//         key: "professional_behavior",
//         label: "Professional Behavior",
//         value: Number(summary.behavior_rating),
//         outOf: 5,
//       },
//     ].map((item) => ({
//       ...item,
//       percentage: Number(((item.value / item.outOf) * 100).toFixed(0)),
//     }));

//     const payload = {
//       overallRating: {
//         value: Number(summary.overall_rating),
//         outOf: 5,
//         totalRatings: Number(summary.total_ratings),
//       },
//       detailedRatings,
//       feedback: feedback.map((item) => ({
//         id: item.id,
//         customerName: item.customer_name,
//         rating: Number(item.overall_rating),
//         comment: item.comment,
//         createdAt: item.created_at,
//       })),
//     };

//     res.json(payload);
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to load fixer dashboard data",
//       error: error.message,
//     });
//   }
// };

// module.exports = { getHomepageData };
