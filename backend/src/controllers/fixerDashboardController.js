const FixerDashboardModel = require("../models/fixerDashboardModel");

class FixerDashboardController {
  static validateFixerRequest(req, res) {
    const fixerId = req.user?.id;
    const role = String(req.user?.role || "").toLowerCase();

    if (!fixerId) {
      res.status(401).json({ message: "Unauthorized" });
      return null;
    }

    if (role !== "fixer") {
      res.status(403).json({ message: "Only fixer accounts can access this resource" });
      return null;
    }

    return fixerId;
  }

  async getSummaryCards(req, res) {
    const db = req.app.get("db");

    try {
      const userId = FixerDashboardController.validateFixerRequest(req, res);
      if (!userId) return;

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

  async getHomepageData(req, res) {
    const db = req.app.get("db");
    const fixerId = FixerDashboardController.validateFixerRequest(req, res);
    const feedbackLimit = Number(req.query.limit) || 5;

    if (!fixerId) return;

    try {
      const providerId = await FixerDashboardModel.getProviderIdByUserId(db, fixerId);
      const [completedJobs, totalProfit, summary, feedback] = await Promise.all([
        FixerDashboardModel.getCompletedJobsCount(db, fixerId),
        FixerDashboardModel.getTotalProfit(db, fixerId),
        FixerDashboardModel.getRatingSummary(db, providerId),
        FixerDashboardModel.getRecentFeedback(db, providerId, feedbackLimit),
      ]);

      const commission = Number((0.1 * totalProfit).toFixed(2));
      const netProfit = Number((totalProfit - commission).toFixed(2));
      const detailedRatings = [
        {
          key: "quality_of_work",
          label: "Quality of Work",
          value: Number(summary?.quality_rating || 0),
          outOf: 5,
        },
        {
          key: "speed_of_service",
          label: "Speed of Service",
          value: Number(summary?.speed_rating || 0),
          outOf: 5,
        },
        {
          key: "price_fairness",
          label: "Price Fairness",
          value: Number(summary?.price_fairness_rating || 0),
          outOf: 5,
        },
        {
          key: "professional_behavior",
          label: "Professional Behavior",
          value: Number(summary?.behavior_rating || 0),
          outOf: 5,
        },
      ].map((item) => ({
        ...item,
        percentage: Number(((item.value / item.outOf) * 100).toFixed(0)),
      }));

      return res.status(200).json({
        message: "Get successfully",
        summary: {
          completedJobs,
          totalProfit,
          commission,
          netProfit,
        },
        overallRating: {
          value: Number(summary?.overall_rating || 0),
          outOf: 5,
          totalRatings: Number(summary?.total_ratings || 0),
        },
        detailedRatings,
        feedback: feedback.map((item) => ({
          id: item.id,
          customerName: item.customer_name,
          rating: Number(item.overall_rating || 0),
          comment: item.comment,
          createdAt: item.created_at,
        })),
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || "Failed to load fixer dashboard data",
      });
    }
  }
}

module.exports = new FixerDashboardController();
