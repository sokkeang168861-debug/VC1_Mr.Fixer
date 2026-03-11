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

  /**
   * Get complete booking agreement details with service, provider, pricing, and reviews
   * @param {Object} db - Database connection
   * @param {number} bookingId - Booking ID
   * @returns {Promise} Complete booking agreement object
   */
  static getBookingAgreementDetails(db, bookingId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          b.id,
          b.customer_id,
          b.service_id,
          b.service_address,
          b.issue_description,
          b.status,
          b.service_fee,
          b.proposed_price,
          b.final_price,
          b.scheduled_at,
          b.created_at,
          s.id as service_id,
          sc.id as category_id,
          sc.name as category_name,
          sc.image as category_image,
          sp.id as provider_id,
          sp.company_name,
          sp.location,
          sp.experience,
          sp.is_verified,
          u.id as fixer_user_id,
          u.full_name as fixer_name,
          u.profile_img,
          u.email as fixer_email,
          u.phone as fixer_phone,
          COALESCE(ROUND(AVG(r.overall_rating), 1), 0) as fixer_rating,
          COUNT(DISTINCT r.id) as fixer_review_count
        FROM bookings b
        INNER JOIN services s ON b.service_id = s.id
        INNER JOIN service_categories sc ON s.category_id = sc.id
        INNER JOIN service_providers sp ON s.provider_id = sp.id
        INNER JOIN users u ON sp.user_id = u.id
        LEFT JOIN reviews r ON r.booking_id IN (
          SELECT b2.id FROM bookings b2 
          WHERE b2.id != b.id AND (
            SELECT COUNT(*) FROM services s4 WHERE s4.id = b2.service_id AND s4.provider_id = sp.id
          ) > 0
        )
        WHERE b.id = ?
        GROUP BY b.id, b.customer_id, b.service_id, b.service_address, b.issue_description, 
                 b.status, b.service_fee, b.proposed_price, b.final_price, b.scheduled_at, b.created_at,
                 s.id, sc.id, sc.name, sc.image, sp.id, sp.company_name, sp.location, sp.experience, 
                 sp.is_verified, u.id, u.full_name, u.profile_img, u.email, u.phone
      `;

      db.query(query, [bookingId], (err, results) => {
        if (err) {
          reject(err);
        } else if (results && results.length > 0) {
          resolve(results[0]);
        } else {
          reject(new Error("Booking not found"));
        }
      });
    });
  }

  /**
   * Update booking with pricing and scheduling details
   * @param {Object} db - Database connection
   * @param {number} bookingId - Booking ID
   * @param {Object} updateData - Data to update (service_fee, proposed_price, scheduled_at, etc)
   * @returns {Promise}
   */
  static updateBookingPricing(db, bookingId, updateData) {
    return new Promise((resolve, reject) => {
      const {
        service_fee,
        proposed_price,
        scheduled_at,
        discount_amount,
        total_amount,
      } = updateData;

      const query = `
        UPDATE bookings
        SET 
          service_fee = ?,
          proposed_price = ?,
          final_price = ?,
          scheduled_at = ?,
          status = 'confirmed',
          updated_at = NOW()
        WHERE id = ?
      `;

      // Calculate final price: proposed_price - discount_amount
      const finalPrice = total_amount || (proposed_price - (discount_amount || 0));

      db.query(
        query,
        [
          service_fee || null,
          proposed_price || null,
          finalPrice || null,
          scheduled_at || null,
          bookingId,
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
