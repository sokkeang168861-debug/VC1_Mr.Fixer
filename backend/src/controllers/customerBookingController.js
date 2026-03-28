const customerBookingService = require("../services/customerBookingService.js");
const { emitNewBooking } = require("../realtime/socketServer");
const CustomerBookingModel = require("../models/customerBookingModel");

class CustomerBookingController {
  async createBooking(req, res) {
    const db = req.app.get("db");
    const io = req.app.get("io");

    try {
      // service already returns FULL booking
      const booking = await customerBookingService.createBooking(
        db,
        req.user,
        req.body,
        req.files || []
      );

      // Get provider to notify
      const providerUserId =
        await CustomerBookingModel.getProviderUserIdByServiceId(
          db,
          booking.service_id
        );

      if (providerUserId) {
        emitNewBooking(io, providerUserId, booking);
      }

      res.status(201).json({
        message: "Booking created successfully",
        data: booking,
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
      const bookings = await customerBookingService.getCompletedHistory(
        db,
        req.user
      );

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

  async getFixerProfile(req, res) {
    const db = req.app.get("db");

    try {
      const profile = await customerBookingService.getFixerProfile(
        db,
        req.user,
        req.params.id
      );

      res.status(200).json({
        message: "Fixer profile fetched successfully",
        data: profile,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to fetch fixer profile",
      });
    }
  }

  async getReceiptDetails(req, res) {
    const db = req.app.get("db");

    try {
      const receipt = await customerBookingService.getReceiptDetails(
        db,
        req.user,
        req.params.id
      );

      res.status(200).json({
        message: "Receipt fetched successfully",
        data: receipt,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to fetch receipt",
      });
    }
  }

  async createPendingPayment(req, res) {
    const db = req.app.get("db");

    try {
      const payment = await customerBookingService.createPendingPayment(
        db,
        req.user,
        req.params.id
      );

      res.status(201).json({
        message: "Pending payment created successfully",
        data: payment,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to create payment",
      });
    }
  }

  async getLatestPayment(req, res) {
    const db = req.app.get("db");

    try {
      const payment = await customerBookingService.getLatestPayment(
        db,
        req.user,
        req.params.id
      );

      res.status(200).json({
        message: "Payment fetched successfully",
        data: payment,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to fetch payment",
      });
    }
  }

  async completeLatestPayment(req, res) {
    const db = req.app.get("db");

    try {
      const payment = await customerBookingService.completeLatestPayment(
        db,
        req.user,
        req.params.id
      );

      res.status(200).json({
        message: "Payment completed successfully",
        data: payment,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to complete payment",
      });
    }
  }

  async getLatestActiveBooking(req, res) {
    const db = req.app.get("db");

    try {
      const booking =
        await customerBookingService.getLatestActiveBooking(
          db,
          req.user
        );

      res.json({ booking });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to load booking",
      });
    }
  }

  async confirmBooking(req, res) {
    const db = req.app.get("db");
    const io = req.app.get("io");

    try {
      const booking = await customerBookingService.confirmBooking(
        db,
        req.user,
        req.params.id
      );

      // 🔥 notify provider in real-time
      const providerUserId =
        await CustomerBookingModel.getProviderUserIdByServiceId(
          db,
          booking.service_id
        );

      if (providerUserId) {
        io.to(`user_${providerUserId}`).emit("booking_confirmed", booking);
      }

      res.json({
        booking,
        message: "Booking confirmed successfully",
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to confirm booking",
      });
    }
  }

  async rejectBooking(req, res) {
    const db = req.app.get("db");
    const io = req.app.get("io");

    try {
      const booking = await customerBookingService.rejectBooking(
        db,
        req.user,
        req.params.id,
        req.body
      );

      // 🔥 notify provider
      const providerUserId =
        await CustomerBookingModel.getProviderUserIdByServiceId(
          db,
          req.body.service_id // ⚠️ may need adjustment if not passed
        );

      if (providerUserId) {
        io.to(`user_${providerUserId}`).emit("booking_rejected", booking);
      }

      res.json({
        booking,
        message: "Booking rejected successfully",
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to reject booking",
      });
    }
  }

  async submitReview(req, res) {
    const db = req.app.get("db");

    try {
      const result = await customerBookingService.submitReview(
        db,
        req.user,
        req.params.id,
        req.body
      );

      res.status(201).json({
        message: "Review submitted successfully",
        data: result,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to submit review",
      });
    }
  }

  async updateBookingLocation(req, res) {
    const db = req.app.get("db");

    try {
      const booking = await customerBookingService.updateBookingLocation(
        db,
        req.user,
        req.params.id,
        req.body
      );

      res.json({
        message: "Booking location updated successfully",
        booking,
      });
    } catch (err) {
      res.status(err.status || 500).json({
        message: err.message || "Failed to update booking location",
      });
    }
  }
}

module.exports = new CustomerBookingController();
