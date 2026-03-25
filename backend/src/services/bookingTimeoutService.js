const { emitBookingUpdated } = require("../realtime/socketServer");
const CustomerBookingModel = require("../models/customerBookingModel");

class BookingTimeoutService {
  constructor() {
    this.timeouts = new Map();
  }

  /**
   * Start a timeout for a booking. If the fixer doesn't accept/reject
   * within 3 minutes, the booking status will be set to 'fixer_reject'.
   * 
   * @param {object} db - mysql2 pool
   * @param {import("socket.io").Server} io 
   * @param {number} bookingId 
   */
  startTimeout(db, io, bookingId) {
    // Clear existing timeout if any (shouldn't happen for a new booking)
    this.clearTimeout(bookingId);

    const timeout = setTimeout(async () => {
      try {
        console.log(`[Timeout] Checking status for booking ${bookingId}`);
        
        // Fetch current booking status
        const booking = await CustomerBookingModel.getBookingDetailsById(db, bookingId);
        
        if (booking && booking.status === 'pending') {
          console.log(`[Timeout] Booking ${bookingId} is still pending. Auto-rejecting.`);
          
          // Update status in database using raw query (mysql2 pool)
          await db.query(
            `UPDATE bookings 
             SET status = 'fixer_reject', 
                 cancellation_reason = 'Auto-rejected: Fixer did not respond within 3 minutes.' 
             WHERE id = ? AND status = 'pending'`,
            [bookingId]
          );

          // Fetch updated booking for notification
          const updatedBooking = await CustomerBookingModel.getBookingDetailsById(db, bookingId);
          
          // Notify customer
          if (updatedBooking) {
            emitBookingUpdated(io, updatedBooking.customer_id, updatedBooking);
            
            // Also notify the fixer so they see it's gone/rejected
            // We need to find the provider's user_id
            const providerUserId = await CustomerBookingModel.getProviderUserIdByServiceId(db, updatedBooking.service_id);
            if (providerUserId) {
                io.to(`user_${providerUserId}`).emit("booking_auto_rejected", updatedBooking);
            }
          }
        } else {
            console.log(`[Timeout] Booking ${bookingId} status is ${booking?.status}. No action needed.`);
        }
      } catch (error) {
        console.error(`[Timeout Error] Failed to auto-reject booking ${bookingId}:`, error);
      } finally {
        this.timeouts.delete(bookingId);
      }
    }, 3 * 60 * 1000); // 3 minutes

    this.timeouts.set(bookingId, timeout);
    console.log(`[Timeout] Started 3-minute timer for booking ${bookingId}`);
  }

  /**
   * Clear a timeout for a booking (e.g., when it's accepted or rejected manually).
   * 
   * @param {number} bookingId 
   */
  clearTimeout(bookingId) {
    if (this.timeouts.has(bookingId)) {
      clearTimeout(this.timeouts.get(bookingId));
      this.timeouts.delete(bookingId);
      console.log(`[Timeout] Cleared timer for booking ${bookingId}`);
    }
  }
}

module.exports = new BookingTimeoutService();
