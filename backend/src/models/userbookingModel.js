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

  /**
   * Get nearby fixers that offer services matching the booking's service category
   * @param {Object} db - Database connection
   * @param {number} bookingId - Booking ID
   * @returns {Promise} Array of fixers with ratings and stats
   */
  static getNearbyFixersByBooking(db, bookingId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          sp.id as provider_id,
          sp.user_id,
          u.full_name,
          u.profile_img,
          sp.company_name,
          sp.location,
          sp.experience,
          sp.is_verified,
          COALESCE(ROUND(AVG(r.overall_rating), 1), 0) as overall_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM bookings b
        INNER JOIN services s ON b.service_id = s.id
        INNER JOIN service_categories sc ON s.category_id = sc.id
        INNER JOIN services s2 ON s2.category_id = sc.id AND s2.is_active = 1
        INNER JOIN service_providers sp ON s2.provider_id = sp.id
        INNER JOIN users u ON sp.user_id = u.id
        LEFT JOIN reviews r ON r.booking_id IN (
          SELECT b2.id FROM bookings b2 
          INNER JOIN services s3 ON b2.service_id = s3.id 
          WHERE s3.provider_id = sp.id
        )
        WHERE b.id = ?
        GROUP BY sp.id, sp.user_id, u.full_name, u.profile_img, sp.company_name, sp.location, sp.experience, sp.is_verified
        ORDER BY overall_rating DESC, review_count DESC
      `;

      db.query(query, [bookingId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = Booking;
