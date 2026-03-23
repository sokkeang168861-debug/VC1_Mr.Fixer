const ProviderRequestService = require("../services/providerRequestService.js");
const FixerDashboardModel = require("../models/fixerDashboardModel");
const CustomerBookingModel = require("../models/customerBookingModel");
const { emitBookingUpdated } = require("../realtime/socketServer");

class ProviderRequestController {
  static async getAllRequests(req, res) {
    try {
      const db = req.app.get("db");
      const provider_id = await FixerDashboardModel.getProviderIdByUserId(db, req.user.id);

      if (!provider_id) {
        return res.status(404).json({ success: false, message: "Fixer profile not found" });
      }

      const requests = await ProviderRequestService.getAllRequests(db, provider_id);

      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      console.error("getAllRequests:", error.message);
      res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
  }

  static async getRequestById(req, res) {
    try {
      const db = req.app.get("db");
      const { id } = req.params;
      const provider_id = await FixerDashboardModel.getProviderIdByUserId(db, req.user.id);

      if (!provider_id) {
        return res.status(404).json({ success: false, message: "Fixer profile not found" });
      }

      const request = await ProviderRequestService.getRequestById(db, id, provider_id);

      if (!request) {
        return res.status(404).json({ success: false, message: "Request not found" });
      }

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      console.error("getRequestById:", error.message);
      res.status(500).json({ success: false, message: "Failed to fetch request detail" });
    }
  }

  static async acceptAndSetProposal(req, res) {
    try {
      const db = req.app.get("db");
      const io = req.app.get("io");
      const { id } = req.params;
      const { items, total } = req.body;
      const provider_id = await FixerDashboardModel.getProviderIdByUserId(db, req.user.id);

      if (!provider_id) {
        return res.status(404).json({ success: false, message: "Fixer profile not found" });
      }

      await ProviderRequestService.acceptAndSetProposal(db, id, provider_id, items, total);

      const booking = await CustomerBookingModel.getBookingDetailsById(db, Number(id));
      emitBookingUpdated(io, booking?.customer_id, booking);

      res.status(200).json({ success: true, message: "Proposal submitted successfully" });
    } catch (error) {
      console.error("acceptAndSetProposal:", error.message);
      res.status(500).json({ success: false, message: "Failed to submit proposal" });
    }
  }
}

module.exports = ProviderRequestController;
