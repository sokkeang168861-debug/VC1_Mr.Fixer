const customerBookingService = require("../services/customerBookingService.js");
const { emitNewBooking } = require("../realtime/socketServer");
const CustomerBookingModel = require("../models/customerBookingModel");

class CustomerBookingController {
  async createBooking(req, res) {
    const db = req.app.get("db");
    const io = req.app.get("io");

    try {
      const result = await customerBookingService.createBooking(db, req.user, req.body, req.files || []);
      const bookingId = result.insertId;

      // Get booking details and provider user ID to notify fixer
      const booking = await CustomerBookingModel.getBookingDetailsById(db, bookingId);
      const providerUserId = await CustomerBookingModel.getProviderUserIdByServiceId(db, req.body.service_id);

      if (providerUserId) {
        emitNewBooking(io, providerUserId, booking);
      }

      res.status(201).json({
        message: "Booking created successfully",
        bookingId: bookingId,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to create booking",
      });
    }
  }

  async getLatestActiveBooking(req, res) {
    const db = req.app.get("db");

    try {
      const booking = await customerBookingService.getLatestActiveBooking(db, req.user);
      res.json({ booking });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to load booking",
      });
    }
  }

  async confirmBooking(req, res) {
    const db = req.app.get("db");

    try {
      const booking = await customerBookingService.confirmBooking(
        db,
        req.user,
        req.params.id
      );
      res.json({ booking, message: "Booking confirmed successfully" });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to confirm booking",
      });
    }
  }

  async rejectBooking(req, res) {
    const db = req.app.get("db");

    try {
      const booking = await customerBookingService.rejectBooking(
        db,
        req.user,
        req.params.id
      );
      res.json({ booking, message: "Booking rejected successfully" });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to reject booking",
      });
    }
  }
}

module.exports = new CustomerBookingController();
