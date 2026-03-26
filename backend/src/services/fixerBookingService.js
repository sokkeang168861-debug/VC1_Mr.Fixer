const FixerBookingModel = require("../models/fixerBookingModel");
// const bookingTimeoutService = require("./bookingTimeoutService");

class FixerBookingService {
  static async getAllRequests(db, provider_id) {
    const requests = await FixerBookingModel.getAllrequest(db, provider_id);
    return requests;
  }

  static async getRequestById(db, booking_id, provider_id) {
    const request = await FixerBookingModel.getById(db, booking_id, provider_id);
    return request;
  }

  static async acceptAndSetProposal(db, booking_id, provider_id, items, total) {
    const result = await FixerBookingModel.acceptAndSetProposal(
      db,
      booking_id,
      provider_id,
      items,
      total
    );

    // Clear the timeout since the booking was accepted
    // bookingTimeoutService.clearTimeout(booking_id);

    return result;
  }

  static async rejectBooking(db, booking_id, provider_id, reason) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        `UPDATE bookings b
         INNER JOIN services s ON s.id = b.service_id
         INNER JOIN service_providers sp ON sp.id = s.provider_id
         SET b.status = 'fixer_reject', b.cancellation_reason = ?
         WHERE b.id = ? AND sp.user_id = ? AND b.status = 'pending'`,
        [reason || 'Provider rejected the booking', booking_id, provider_id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Booking not found or not owned by provider");
      }

      await connection.commit();

      // Clear the timeout since the booking was rejected
      // bookingTimeoutService.clearTimeout(booking_id);

      return { message: "Booking rejected successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async markArrived(db, booking_id, provider_id) {
    const result = await FixerBookingModel.markArrived(
      db,
      booking_id,
      provider_id
    );

    if (result.affectedRows === 0) {
      const error = new Error("Booking is not ready to be marked as arrived.");
      error.status = 400;
      throw error;
    }

    return { message: "Booking marked as arrived successfully" };
  }
}

module.exports = FixerBookingService;
