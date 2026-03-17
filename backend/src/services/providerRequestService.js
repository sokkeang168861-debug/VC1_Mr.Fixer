const BookingModel = require("../models/bookingModel");

// This service is a thin pass-through to BookingModel.
// Add business logic here (e.g. notifications, logging) as the app grows.
class ProviderRequestService {
  static getAllRequests(db, provider_id) {
    return BookingModel.getAllrequest(db, provider_id);
  }

  static getRequestById(db, booking_id, provider_id) {
    return BookingModel.getById(db, booking_id, provider_id);
  }

  static acceptAndSetProposal(db, booking_id, provider_id, items, total) {
    return BookingModel.acceptAndSetProposal(db, booking_id, provider_id, items, total);
  }
}

module.exports = ProviderRequestService;
