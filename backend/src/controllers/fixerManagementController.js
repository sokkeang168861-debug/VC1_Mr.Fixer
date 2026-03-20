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

  static async updateFixer(req, res) {
    const db = req.app.get("db");
    const { id } = req.params;

    try {
      const result = await FixerManagementService.updateFixer(
        db,
        Number(id),
        req.body
      );

      if (!result.found) {
        return res
          .status(404)
          .json({ success: false, message: "Fixer not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Fixer updated successfully" });
    } catch (error) {
      console.error("Failed to update fixer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update fixer",
      });
    }
  }

  static async deleteFixer(req, res) {
    const db = req.app.get("db");
    const { id } = req.params;

    try {
      const result = await FixerManagementService.deleteFixer(db, Number(id));

      if (!result.found) {
        return res
          .status(404)
          .json({ success: false, message: "Fixer not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Fixer deleted successfully" });
    } catch (error) {
      console.error("Failed to delete fixer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete fixer",
      });
    }
  }
}

module.exports = FixerManagementController;
