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
}

module.exports = new CustomerBookingController();
