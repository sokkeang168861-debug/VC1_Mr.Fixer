const FixerManagementService = require("../services/fixerManagementService");

class FixerManagementController {
  static async createFixer(req, res) {
    const db = req.app.get("db");

    try {
      const created = await FixerManagementService.createFixer(
        db,
        req.body,
        req.file
      );
      res.status(201).json({
        success: true,
        message: "Fixer created successfully",
        data: created,
      });
    } catch (error) {
      console.error("Failed to create fixer:", error);

      if (
        error.message === "Full name and email are required" ||
        error.message === "Password is required" ||
        error.message === "Experience must be a valid non-negative number" ||
        error.message === "Password must be at least 6 characters" ||
        error.message === "Email already exists" ||
        error.message ===
          "Unable to save profile image. Please use a smaller image and try again" ||
        error.message === "Latitude and longitude must be provided together" ||
        error.message === "Latitude must be a valid number" ||
        error.message === "Longitude must be a valid number" ||
        error.message === "Latitude must be between -90 and 90" ||
        error.message === "Longitude must be between -180 and 180" ||
        error.message === "Unable to detect coordinates from location" ||
        error.message === "Geocoding timed out. Please try again"
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          success: false,
          message: "Invalid category selected. Please refresh categories and try again.",
        });
      }

      if (error.code === "ER_BAD_FIELD_ERROR") {
        return res.status(500).json({
          success: false,
          message: "Database schema is outdated. Please run latest migrations.",
        });
      }

      if (error.code === "ECONNRESET" || error.message?.includes("ECONNRESET")) {
        return res.status(503).json({
          success: false,
          message: "Database connection was interrupted. Please try again.",
        });
      }

      const detail = error?.sqlMessage || error?.message;
      res.status(500).json({
        success: false,
        message:
          process.env.NODE_ENV === "production" || !detail
            ? "Failed to create fixer"
            : `Failed to create fixer: ${detail}`,
      });
    }
  }

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

  static async getFixerDetail(req, res) {
    const db = req.app.get("db");
    const { id } = req.params;

    try {
      const result = await FixerManagementService.getFixerDetail(db, Number(id));

      if (!result.found) {
        return res
          .status(404)
          .json({ success: false, message: "Fixer not found" });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Failed to fetch fixer detail:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load fixer details",
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
        req.body,
        req.file
      );

      if (!result.found) {
        return res
          .status(404)
          .json({ success: false, message: "Fixer not found" });
      }

      res.status(200).json({ success: true, message: "Fixer updated successfully" });
    } catch (error) {
      console.error("Failed to update fixer:", error);

      if (
        error.message === "Password must be at least 6 characters" ||
        error.message === "Latitude and longitude must be provided together" ||
        error.message ===
          "Unable to save profile image. Please use a smaller image and try again" ||
        error.message === "Latitude must be a valid number" ||
        error.message === "Longitude must be a valid number" ||
        error.message === "Latitude must be between -90 and 90" ||
        error.message === "Longitude must be between -180 and 180" ||
        error.message === "Unable to detect coordinates from location" ||
        error.message === "Geocoding timed out. Please try again"
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          success: false,
          message: "Invalid category selected. Please refresh categories and try again.",
        });
      }

      if (error.code === "ER_BAD_FIELD_ERROR") {
        return res.status(500).json({
          success: false,
          message: "Database schema is outdated. Please run latest migrations.",
        });
      }

      if (error.code === "ECONNRESET" || error.message?.includes("ECONNRESET")) {
        return res.status(503).json({
          success: false,
          message: "Database connection was interrupted. Please try again.",
        });
      }

      const detail = error?.sqlMessage || error?.message;
      res.status(500).json({
        success: false,
        message:
          process.env.NODE_ENV === "production" || !detail
            ? "Failed to update fixer"
            : `Failed to update fixer: ${detail}`,
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
