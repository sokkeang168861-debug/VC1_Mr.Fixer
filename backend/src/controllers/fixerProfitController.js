const FixerProfitService = require("../services/fixerProfitService");

class FixerProfitController {
  async getProfitData(req, res) {
    const db = req.app.get("db");

    try {
      const result = await FixerProfitService.getProfitData(db, req.user);

      res.status(200).json({
        message: "Fixer profit data fetched successfully",
        data: result,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Failed to fetch fixer profit data",
      });
    }
  }
}

module.exports = new FixerProfitController();
