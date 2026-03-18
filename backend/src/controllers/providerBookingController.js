const ProviderBookingService = require("../services/providerBookingService.js");


class ProviderBookingController {
  async getAllRequests(req, res) {
    try {
      const db = req.app.get("db");
      const provider_id = req.user.id;

      const requests = await ProviderBookingService.getAllRequests(db, provider_id);

      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      console.error("getAllRequests:", error.message);
      res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
  }

  async getRequestById(req, res) {
    try {
      const db = req.app.get("db");
      const { id } = req.params;
      const provider_id = req.user.id;

      const request = await ProviderBookingService.getRequestById(db, id, provider_id);

      if (!request) {
        return res.status(404).json({ success: false, message: "Request not found" });
      }

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      console.error("getRequestById:", error.message);
      res.status(500).json({ success: false, message: "Failed to fetch request detail" });
    }
  }

  async acceptAndSetProposal(req, res) {
    try {
      const db = req.app.get("db");
      const { id } = req.params;
      const { items, total } = req.body;
      const provider_id = req.user.id;

      await ProviderBookingService.acceptAndSetProposal(db, id, provider_id, items, total);

      res.status(200).json({ success: true, message: "Proposal submitted successfully" });
    } catch (error) {
      console.error("acceptAndSetProposal:", error.message);
      res.status(500).json({ success: false, message: "Failed to submit proposal" });
    }
  }
}


module.exports = new ProviderBookingController();
