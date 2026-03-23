const customerBookingService = require("../services/customerBookingService.js");

class CustomerBookingController {
  async createBooking(req, res) {
    const db = req.app.get("db");

    try {
      const result = await customerBookingService.createBooking(db, req.user, req.body, req.files || []);

      res.status(201).json({
        message: "Booking created successfully",
        bookingId: result.insertId,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to create booking",
      });
    }
  }

  async getCompletedHistory(req, res) {
    const db = req.app.get("db");

    try {
      const bookings = await customerBookingService.getCompletedHistory(db, req.user);

      res.status(200).json({
        message: "Completed booking history fetched successfully",
        data: bookings,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to fetch booking history",
      });
    }
  }
}

module.exports = new CustomerBookingController();
