const BookingModel = require("../models/bookingModel");

class ProviderRequestService {
  static async getAllRequests(db, provider_id) {
    try {
      const requests = await BookingModel.getAllrequest(db, provider_id);
      return requests;
    } catch (error) {
      throw error;
    }
  }

  static async getRequestById(db, booking_id, provider_id) {
    try {
      const request = await BookingModel.getById(db, booking_id, provider_id);
      return request;
    } catch (error) {
      throw error;
    }
  }

  static async acceptAndSetProposal(db, booking_id, provider_id, items, total) {
    try {
      const result = await BookingModel.acceptAndSetProposal(
        db,
        booking_id,
        provider_id,
        items,
        total
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProviderRequestService;
