class Booking {
  /**
   * Insert a booking record using data from the customer form
   * @param {Object} db
   * @param {Object} bookingData
   */
  static createBooking(db, bookingData) {
    return new Promise((resolve, reject) => {
      const {
        customer_id,
        service_id,
        service_address,
        issue_description,
        urgency,
        photos,
      } = bookingData;

      const query = `
        INSERT INTO bookings (
          customer_id,
          service_id,
          service_address,
          issue_description,
          status,
          proposal_notes,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const photosData = photos ? JSON.stringify(photos) : null;

      db.query(
        query,
        [
          customer_id,
          service_id,
          service_address,
          issue_description,
          urgency, // storing urgency as status initially
          photosData,
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }
}

module.exports = Booking;
