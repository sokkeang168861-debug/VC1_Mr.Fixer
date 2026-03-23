class BookingTimeoutService {
  constructor() {
    this.timeouts = new Map(); // bookingId -> timeoutId
    this.io = null;
    this.db = null;
  }

  init(io, db) {
    this.io = io;
    this.db = db;
    console.log("Booking timeout service initialized");
  }

  // Start timeout for a new booking
  startTimeout(bookingId, customerId) {
    // Clear any existing timeout for this booking
    this.clearTimeout(bookingId);

    // Set 3-minute timeout
    const timeoutId = setTimeout(async () => {
      await this.handleTimeout(bookingId, customerId);
    }, 3 * 60 * 1000); // 3 minutes

    this.timeouts.set(bookingId, timeoutId);
    console.log(`Timeout started for booking ${bookingId}`);
  }

  // Clear timeout when booking is accepted/rejected
  clearTimeout(bookingId) {
    const timeoutId = this.timeouts.get(bookingId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(bookingId);
      console.log(`Timeout cleared for booking ${bookingId}`);
    }
  }

  // Handle timeout - mark booking as missed and notify user
  async handleTimeout(bookingId, customerId) {
    try {
      // Update booking status to 'missed'
      const [result] = await this.db.query(
        "UPDATE bookings SET status = 'missed' WHERE id = ? AND status = 'pending'",
        [bookingId]
      );

      if (result.affectedRows > 0) {
        console.log(`Booking ${bookingId} marked as missed`);

        // Notify the customer via WebSocket
        this.io.to(`user_${customerId}`).emit("booking_missed", {
          bookingId,
          message: "Your booking request has expired. Please find a new fixer.",
          timestamp: new Date().toISOString()
        });

        // Clean up the timeout
        this.timeouts.delete(bookingId);
      }
    } catch (error) {
      console.error("Error handling booking timeout:", error);
    }
  }

  // Get all active timeouts (for debugging)
  getActiveTimeouts() {
    return Array.from(this.timeouts.keys());
  }

  // Clean up all timeouts (for server shutdown)
  cleanup() {
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();
    console.log("All booking timeouts cleared");
  }
}

module.exports = new BookingTimeoutService();