const FixerBookingService = require("../services/fixerBookingService.js");

class FixerBookingController {
  static async getAllRequests(req, res) {
    try {
      const db = req.app.get("db");

      const provider_id = req.user.id; 
      // assuming provider is logged in and middleware added req.user

      const requests = await FixerBookingService.getAllRequests(
        db,
        provider_id
      );

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch requests",
      });
    }
  }

  static async getRequestById(req, res) {
    try {
      const db = req.app.get("db");
      const { id } = req.params;
      const provider_id = req.user.id;

      const request = await FixerBookingService.getRequestById(
        db,
        id,
        provider_id
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch request detail",
      });
    }
  }

  static async acceptAndSetProposal(req, res) {
    try {
      const db = req.app.get("db");
      const { id } = req.params;
      const { items, total } = req.body;
      const provider_id = req.user.id;

      await FixerBookingService.acceptAndSetProposal(
        db,
        id,
        provider_id,
        items,
        total
      );

      res.status(200).json({
        success: true,
        message: "Proposal submitted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to submit proposal",
      });
    }
  }

  static async rejectBooking(req, res) {
    try {
      const db = req.app.get("db");
      const { id } = req.params;
      const { reason } = req.body;
      const provider_id = req.user.id;

      const result = await FixerBookingService.rejectBooking(
        db,
        id,
        provider_id,
        reason
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to reject booking",
      });
    }
  }
}

module.exports = FixerBookingController;
