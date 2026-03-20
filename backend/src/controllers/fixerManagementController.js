const FixerManagementService = require("../services/fixerManagementService");

class FixerManagementController {
  static async getFixers(req, res) {
    const db = req.app.get("db");

    try {
      const fixers = await FixerManagementService.listFixers(db);
      res.status(200).json({ success: true, data: fixers });
    } catch (error) {
      console.error("Failed to fetch fixers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load fixer list",
      });
    }
  }
}

module.exports = FixerManagementController;
