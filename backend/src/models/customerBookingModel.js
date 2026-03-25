class CustomerBooking {
  static mapBookingRow(row, proposalItems = []) {
    if (!row) return null;

    return {
      id: row.id,
      customer_id: row.customer_id,
      service_id: row.service_id,
      service_address: row.service_address,
      issue_description: row.issue_description,
      urgent_level: row.urgent_level,
      status: row.status,
      created_at: row.created_at,
      scheduled_at: row.scheduled_at,
      service_fee:
        row.service_fee !== null && row.service_fee !== undefined
          ? Number(row.service_fee)
          : null,
      category_name: row.category_name || "",
      fixer_name: row.fixer_name || "",
      fixer_email: row.fixer_email || "",
      fixer_phone: row.fixer_phone || "",
      proposal_items: proposalItems.map((item) => ({
        id: item.id,
        name: item.name,
        price:
          item.price !== null && item.price !== undefined
            ? Number(item.price)
            : 0,
      })),
    };
  }

  static async createBooking(db, payload, files = []) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        `INSERT INTO bookings (
          customer_id,
          service_id,
          issue_description,
          service_address,
          latitude,
          longitude,
          urgent_level,
          status,
          scheduled_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.customer_id,
          payload.service_id,
          payload.issue_description,
          payload.service_address || null,
          payload.latitude,
          payload.longitude,
          payload.urgent_level || "pending",
          payload.status || "pending",
          payload.scheduled_at || null,
        ]
      );

      const bookingId = result.insertId;

      const imageValues = files
        .filter((file) => file?.buffer)
        .map((file) => [bookingId, file.buffer]);

      if (imageValues.length > 0) {
        await connection.query(
          "INSERT INTO issue_img (booking_id, image) VALUES ?",
          [imageValues]
        );
      }

      await connection.commit();

      // return full booking details (better for API + socket)
      return await this.getBookingDetailsById(db, bookingId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getCompletedHistory(db, customerId) {
    const [rows] = await db.query(
      `SELECT
        b.id AS booking_id,
        b.service_id,
        b.status,
        b.created_at,
        sc.name AS category_name,
        u.full_name AS fixer_name,
        u.profile_img AS fixer_avatar,
        COALESCE(payment_totals.amount, 0) AS amount,
        r.id AS review_id,
        r.speed_rating,
        r.quality_rating,
        r.price_fairness_rating,
        r.behavior_rating,
        r.overall_rating,
        r.comment AS review_comment,
        r.created_at AS review_created_at
      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users u ON u.id = sp.user_id
      LEFT JOIN (
        SELECT booking_id, SUM(amount) AS amount
        FROM payments
        WHERE status IS NULL OR LOWER(status) IN ('paid', 'success', 'completed')
        GROUP BY booking_id
      ) AS payment_totals ON payment_totals.booking_id = b.id
      LEFT JOIN reviews r ON r.booking_id = b.id
      WHERE b.customer_id = ?
        AND LOWER(b.status) = 'complete'
      ORDER BY b.created_at DESC`,
      [customerId]
    );

    return rows.map((row) => {
      const historyItem = {
        ...row,
        amount: Number(row.amount || 0),
        has_review: Boolean(row.review_id),
        review: row.review_id
          ? {
              id: row.review_id,
              speed_rating: Number(row.speed_rating || 0),
              quality_rating: Number(row.quality_rating || 0),
              price_fairness_rating: Number(row.price_fairness_rating || 0),
              behavior_rating: Number(row.behavior_rating || 0),
              overall_rating: Number(row.overall_rating || 0),
              comment: row.review_comment || "",
              created_at: row.review_created_at,
            }
          : null,
      };

      if (
        historyItem.fixer_avatar &&
        Buffer.isBuffer(historyItem.fixer_avatar)
      ) {
        historyItem.fixer_avatar = `data:image/jpeg;base64,${historyItem.fixer_avatar.toString(
          "base64"
        )}`;
      }

      return historyItem;
    });
  }

  static async createReview(db, payload) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [bookingRows] = await connection.query(
        `SELECT
          b.id,
          b.customer_id,
          b.status,
          s.provider_id
        FROM bookings b
        INNER JOIN services s ON s.id = b.service_id
        WHERE b.id = ?
        LIMIT 1
        FOR UPDATE`,
        [payload.booking_id]
      );

      const booking = bookingRows[0];

      if (!booking || Number(booking.customer_id) !== Number(payload.customer_id)) {
        const error = new Error("Booking not found");
        error.status = 404;
        throw error;
      }

      if (String(booking.status || "").toLowerCase() !== "complete") {
        const error = new Error("You can only review completed bookings");
        error.status = 400;
        throw error;
      }

      const [existingReviewRows] = await connection.query(
        `SELECT id
         FROM reviews
         WHERE booking_id = ?
         LIMIT 1
         FOR UPDATE`,
        [payload.booking_id]
      );

      if (existingReviewRows[0]) {
        const error = new Error("This booking has already been reviewed");
        error.status = 409;
        throw error;
      }

      const [insertResult] = await connection.query(
        `INSERT INTO reviews (
          booking_id,
          speed_rating,
          quality_rating,
          price_fairness_rating,
          behavior_rating,
          overall_rating,
          comment,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          payload.booking_id,
          payload.speed_rating,
          payload.quality_rating,
          payload.price_fairness_rating,
          payload.behavior_rating,
          payload.overall_rating,
          payload.comment || null,
        ]
      );

      const [summaryRows] = await connection.query(
        `SELECT
          ROUND(AVG(r.speed_rating), 1) AS speed_rating,
          ROUND(AVG(r.quality_rating), 1) AS quality_rating,
          ROUND(AVG(r.price_fairness_rating), 1) AS price_fairness_rating,
          ROUND(AVG(r.behavior_rating), 1) AS behavior_rating,
          ROUND(AVG(r.overall_rating), 1) AS overall_rating
        FROM reviews r
        INNER JOIN bookings b ON b.id = r.booking_id
        INNER JOIN services s ON s.id = b.service_id
        WHERE s.provider_id = ?`,
        [booking.provider_id]
      );

      const summary = summaryRows[0] || {};

      await connection.query(
        `UPDATE service_providers
         SET
           speed_rating = ?,
           quality_rating = ?,
           price_fairness_rating = ?,
           behavior_rating = ?,
           overall_rating = ?
         WHERE id = ?`,
        [
          summary.speed_rating,
          summary.quality_rating,
          summary.price_fairness_rating,
          summary.behavior_rating,
          summary.overall_rating,
          booking.provider_id,
        ]
      );

      const [reviewRows] = await connection.query(
        `SELECT
          id,
          booking_id,
          speed_rating,
          quality_rating,
          price_fairness_rating,
          behavior_rating,
          overall_rating,
          comment,
          created_at
        FROM reviews
        WHERE id = ?
        LIMIT 1`,
        [insertResult.insertId]
      );

      await connection.commit();

      return {
        review: reviewRows[0] || null,
        provider_ratings: {
          speed_rating: Number(summary.speed_rating || 0),
          quality_rating: Number(summary.quality_rating || 0),
          price_fairness_rating: Number(summary.price_fairness_rating || 0),
          behavior_rating: Number(summary.behavior_rating || 0),
          overall_rating: Number(summary.overall_rating || 0),
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getLatestPendingBookingByCustomerId(db, customerId) {
    return this.getLatestActiveBookingByCustomerId(db, customerId, ["pending"]);
  }

  static async getLatestActiveBookingByCustomerId(
    db,
    customerId,
    statuses = ["pending", "fixer_accept", "customer_accept"]
  ) {
    const placeholders = statuses.map(() => "?").join(", ");

    const [rows] = await db.query(
      `SELECT
        b.id,
        b.customer_id,
        b.service_id,
        b.service_address,
        b.issue_description,
        b.urgent_level,
        b.status,
        b.service_fee,
        b.created_at,
        b.scheduled_at,
        sc.name AS category_name,
        fixer.full_name AS fixer_name,
        fixer.email AS fixer_email,
        fixer.phone AS fixer_phone
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       INNER JOIN service_categories sc ON sc.id = s.category_id
       INNER JOIN service_providers sp ON sp.id = s.provider_id
       INNER JOIN users fixer ON fixer.id = sp.user_id
       WHERE b.customer_id = ?
         AND b.status IN (${placeholders})
       ORDER BY b.created_at DESC, b.id DESC
       LIMIT 1`,
      [customerId, ...statuses]
    );

    const booking = rows[0];
    if (!booking) return null;

    return this.getBookingDetailsById(db, booking.id, customerId);
  }

  static async getBookingDetailsById(db, bookingId, customerId = null) {
    const values = [bookingId];
    const customerFilter = customerId ? "AND b.customer_id = ?" : "";

    if (customerId) values.push(customerId);

    const [rows] = await db.query(
      `SELECT
        b.id,
        b.customer_id,
        b.service_id,
        b.service_address,
        b.issue_description,
        b.urgent_level,
        b.status,
        b.service_fee,
        b.created_at,
        b.scheduled_at,
        sc.name AS category_name,
        fixer.full_name AS fixer_name,
        fixer.email AS fixer_email,
        fixer.phone AS fixer_phone
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       INNER JOIN service_categories sc ON sc.id = s.category_id
       INNER JOIN service_providers sp ON sp.id = s.provider_id
       INNER JOIN users fixer ON fixer.id = sp.user_id
       WHERE b.id = ?
         ${customerFilter}
       LIMIT 1`,
      values
    );

    const booking = rows[0];
    if (!booking) return null;

    const [proposalItems] = await db.query(
      `SELECT id, name, price
       FROM proposal_price
       WHERE booking_id = ?
       ORDER BY id ASC`,
      [bookingId]
    );

    return this.mapBookingRow(booking, proposalItems);
  }

  static async getProviderUserIdByServiceId(db, serviceId) {
    const [rows] = await db.query(
      `SELECT sp.user_id
       FROM services s
       INNER JOIN service_providers sp ON sp.id = s.provider_id
       WHERE s.id = ?`,
      [serviceId]
    );

    return rows[0]?.user_id || null;
  }

  static async confirmBookingByCustomer(db, bookingId, customerId) {
    const [result] = await db.query(
      `UPDATE bookings
       SET status = 'customer_accept'
       WHERE id = ?
         AND customer_id = ?
         AND status = 'fixer_accept'`,
      [bookingId, customerId]
    );

    return result;
  }

  static async rejectBookingByCustomer(db, bookingId, customerId) {
    const [result] = await db.query(
      `UPDATE bookings
       SET status = 'customer_reject'
       WHERE id = ?
         AND customer_id = ?
         AND status IN ('pending', 'fixer_accept')`,
      [bookingId, customerId]
    );

    return result;
  }
}

module.exports = CustomerBooking;
