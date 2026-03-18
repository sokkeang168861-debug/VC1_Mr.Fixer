const customerBookingService = require("../services/customerBookingService.js");
const serviceCategoryService = require("../services/serviceCategoryService.js");

class CustomerBookingController {
  async getBookingCategories(req, res) {
    const db = req.app.get("db");
    try {
      const categories = await serviceCategoryService.getAllCategories(db);
      res.status(200).json({ data: categories });
    } catch (err) {
      console.error("getBookingCategories:", err.message);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  }

  async createBooking(req, res) {
    const db = req.app.get("db");

    try {
      const result = await customerBookingService.createBooking(db, req.user, req.body);

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

  async getMyBookings(req, res) {
    const db = req.app.get("db");
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const BookingModel = require("../models/bookingModel").CustomerBooking;
      const bookings = await BookingModel.getBookingsByCustomer(db, customerId);
      res.status(200).json(bookings);
    } catch (err) {
      console.error("getMyBookings:", err.message);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }
}

module.exports = new CustomerBookingController();
