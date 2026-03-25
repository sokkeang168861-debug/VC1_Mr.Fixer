const FixerBookingService = require("../services/fixerBookingService.js");
const { emitBookingUpdated } = require("../realtime/socketServer");
const CustomerBookingModel = require("../models/customerBookingModel");

class FixerBookingController {
  static async getAllRequests(req, res) {
    try {
      const db = req.app.get("db");

      const provider_id = req.user.id; 
      // assuming provider is logged in and middleware added req.user

      const requests = await FixerBookingService.getAllRequests(
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

  static async getActiveJob(req, res) {
    try {
      const db = req.app.get("db");
      const provider_user_id = req.user.id;

      const activeJob = await FixerBookingService.getActiveJob(db, provider_user_id);

      res.status(200).json({
        success: true,
        data: activeJob,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch active job",
      });
    }
  }

  static async getRequestById(req, res) {
    try {
      const db = req.app.get("db");
      const { id } = req.params;
      const provider_id = req.user.id;

      const request = await FixerBookingService.getRequestById(
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
      const io = req.app.get("io");
      const { id } = req.params;
      const { items, total } = req.body;
      const provider_id = req.user.id;

      await FixerBookingService.acceptAndSetProposal(
        db,
        id,
        provider_id,
        items,
        total
      );

      // Notify customer that proposal is submitted
      const booking = await CustomerBookingModel.getBookingDetailsById(db, Number(id));
      if (booking) {
        emitBookingUpdated(io, booking.customer_id, booking);
      }

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

  static async rejectBooking(req, res) {
    try {
      const db = req.app.get("db");
      const io = req.app.get("io");
      const { id } = req.params;
      const { reason } = req.body;
      const provider_id = req.user.id;

      const result = await FixerBookingService.rejectBooking(
        db,
        id,
        provider_id,
        reason
      );

      // Notify customer that booking was rejected
      const booking = await CustomerBookingModel.getBookingDetailsById(db, Number(id));
      if (booking) {
        emitBookingUpdated(io, booking.customer_id, booking);
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to reject booking",
      });
    }
  }
}

module.exports = FixerBookingController;