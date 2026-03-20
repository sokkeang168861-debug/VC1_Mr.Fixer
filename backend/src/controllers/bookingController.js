const ProviderRequestService = require("../services/providerRequestService.js");

class ProviderRequestController {
  static async getAllRequests(req, res) {
    try {
      const db = req.app.get("db");

      const provider_id = req.user.id; 
      // assuming provider is logged in and middleware added req.user

      const requests = await ProviderRequestService.getAllRequests(
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

      const request = await ProviderRequestService.getRequestById(
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

      const result = await ProviderRequestService.acceptAndSetProposal(
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
}

module.exports = ProviderRequestController;
