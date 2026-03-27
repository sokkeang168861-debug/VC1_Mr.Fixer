class CustomerBooking {
  static mapBookingRow(row, proposalItems = []) {
    if (!row) return null;

    return {
      id: row.id,
      customer_id: row.customer_id,
      service_id: row.service_id,
      service_address: row.service_address,
      latitude:
        row.latitude !== null && row.latitude !== undefined
          ? Number(row.latitude)
          : null,
      longitude:
        row.longitude !== null && row.longitude !== undefined
          ? Number(row.longitude)
          : null,
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
      fixer_company_name: row.fixer_company_name || "",
      provider_location: row.provider_location || "",
      provider_latitude:
        row.provider_latitude !== null && row.provider_latitude !== undefined
          ? Number(row.provider_latitude)
          : null,
      provider_longitude:
        row.provider_longitude !== null && row.provider_longitude !== undefined
          ? Number(row.provider_longitude)
          : null,
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

  static formatReceiptRecord(row, items = []) {
    if (!row) return null;

    const normalizedItems = items.map((item) => ({
      id: Number(item.id),
      name: item.name || "Receipt item",
      price:
        item.price !== null && item.price !== undefined
          ? Number(item.price)
          : 0,
    }));

    const receiptTotal = normalizedItems.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );

    const amountPaid =
      row.amount_paid !== null && row.amount_paid !== undefined
        ? Number(row.amount_paid)
        : receiptTotal;

    let fixerAvatar = row.fixer_avatar || null;
    if (fixerAvatar && Buffer.isBuffer(fixerAvatar)) {
      fixerAvatar = `data:image/jpeg;base64,${fixerAvatar.toString("base64")}`;
    }

    return {
      bookingId: Number(row.booking_id),
      serviceId: Number(row.service_id),
      service: row.category_name || `Service #${row.service_id}`,
      status: String(row.status || "complete")
        .replace(/^complete$/i, "Completed")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      date: row.receipt_date || row.created_at,
      orderId: `#BK-${String(row.booking_id).padStart(5, "0")}`,
      amount: amountPaid,
      receiptTotal,
      items: normalizedItems,
      fixer: {
        name: row.fixer_name || "Assigned Fixer",
        companyName: row.fixer_company_name || "",
        avatar: fixerAvatar,
      },
    };
  }

  static serializePayment(payment, fallbackStatus = "pending") {
    if (!payment) return null;

    return {
      id: Number(payment.id),
      booking_id: Number(payment.booking_id),
      amount:
        payment.amount !== null && payment.amount !== undefined
          ? Number(payment.amount)
          : 0,
      status: payment.status || fallbackStatus,
      transaction_id: payment.transaction_id || null,
      paid_at: payment.paid_at || null,
      created_at: payment.created_at || null,
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

  static async getReceiptDetailsByBookingId(db, bookingId, customerId) {
    const [rows] = await db.query(
      `SELECT
        b.id AS booking_id,
        b.service_id,
        b.status,
        b.created_at,
        sc.name AS category_name,
        fixer.full_name AS fixer_name,
        fixer.profile_img AS fixer_avatar,
        sp.company_name AS fixer_company_name,
        COALESCE(
          payment_totals.amount_paid,
          receipt_totals.receipt_amount,
          b.service_fee,
          0
        ) AS amount_paid,
        COALESCE(payment_totals.latest_paid_at, b.created_at) AS receipt_date
      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users fixer ON fixer.id = sp.user_id
      LEFT JOIN (
        SELECT
          booking_id,
          SUM(amount) AS amount_paid,
          MAX(COALESCE(paid_at, created_at)) AS latest_paid_at
        FROM payments
        WHERE status IS NULL OR LOWER(status) IN ('paid', 'success', 'completed')
        GROUP BY booking_id
      ) AS payment_totals ON payment_totals.booking_id = b.id
      LEFT JOIN (
        SELECT booking_id, SUM(price) AS receipt_amount
        FROM receipt
        GROUP BY booking_id
      ) AS receipt_totals ON receipt_totals.booking_id = b.id
      WHERE b.id = ?
        AND b.customer_id = ?
        AND LOWER(b.status) = 'complete'
      LIMIT 1`,
      [bookingId, customerId]
    );

    const booking = rows[0];
    if (!booking) return null;

    const [receiptItems] = await db.query(
      `SELECT id, name, price
       FROM receipt
       WHERE booking_id = ?
       ORDER BY id ASC`,
      [bookingId]
    );

    return this.formatReceiptRecord(booking, receiptItems);
  }

  static async createPendingPaymentByBookingId(db, bookingId, customerId) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [bookingRows] = await connection.query(
        `SELECT
          b.id,
          b.customer_id,
          b.status,
          COALESCE(receipt_totals.receipt_amount, b.service_fee, 0) AS payment_amount
        FROM bookings b
        LEFT JOIN (
          SELECT booking_id, SUM(price) AS receipt_amount
          FROM receipt
          GROUP BY booking_id
        ) AS receipt_totals ON receipt_totals.booking_id = b.id
        WHERE b.id = ?
          AND b.customer_id = ?
        LIMIT 1
        FOR UPDATE`,
        [bookingId, customerId]
      );

      const booking = bookingRows[0];

      if (!booking) {
        const error = new Error("Booking not found");
        error.status = 404;
        throw error;
      }

      if (String(booking.status || "").toLowerCase() !== "complete") {
        const error = new Error("Payment can only be started after the booking is complete");
        error.status = 400;
        throw error;
      }

      const [pendingRows] = await connection.query(
        `SELECT
          id,
          booking_id,
          amount,
          status,
          transaction_id,
          paid_at,
          created_at
        FROM payments
        WHERE booking_id = ?
          AND LOWER(status) = 'pending'
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE`,
        [bookingId]
      );

      if (pendingRows[0]) {
        await connection.commit();
        return pendingRows[0];
      }

      const amount =
        booking.payment_amount !== null && booking.payment_amount !== undefined
          ? Number(booking.payment_amount)
          : 0;

      const transactionId = `PENDING-${bookingId}-${Date.now()}`;

      const [insertResult] = await connection.query(
        `INSERT INTO payments (
          booking_id,
          amount,
          status,
          transaction_id,
          paid_at,
          created_at
        ) VALUES (?, ?, 'pending', ?, NULL, NOW())`,
        [bookingId, amount, transactionId]
      );

      const [paymentRows] = await connection.query(
        `SELECT
          id,
          booking_id,
          amount,
          status,
          transaction_id,
          paid_at,
          created_at
        FROM payments
        WHERE id = ?
        LIMIT 1`,
        [insertResult.insertId]
      );

      await connection.commit();
      return this.serializePayment(paymentRows[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getLatestPaymentByBookingId(db, bookingId, customerId) {
    const [bookingRows] = await db.query(
      `SELECT id
       FROM bookings
       WHERE id = ?
         AND customer_id = ?
       LIMIT 1`,
      [bookingId, customerId]
    );

    if (!bookingRows[0]) {
      return null;
    }

    const [paymentRows] = await db.query(
      `SELECT
        id,
        booking_id,
        amount,
        status,
        transaction_id,
        paid_at,
        created_at
      FROM payments
      WHERE booking_id = ?
      ORDER BY id DESC
      LIMIT 1`,
      [bookingId]
    );

    const payment = paymentRows[0];
    return this.serializePayment(payment, "pending");
  }

  static async completeLatestPaymentByBookingId(db, bookingId, customerId) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [bookingRows] = await connection.query(
        `SELECT id
         FROM bookings
         WHERE id = ?
           AND customer_id = ?
         LIMIT 1
         FOR UPDATE`,
        [bookingId, customerId]
      );

      if (!bookingRows[0]) {
        const error = new Error("Booking not found");
        error.status = 404;
        throw error;
      }

      const [paymentRows] = await connection.query(
        `SELECT
          id,
          booking_id,
          amount,
          status,
          transaction_id,
          paid_at,
          created_at
        FROM payments
        WHERE booking_id = ?
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE`,
        [bookingId]
      );

      const latestPayment = paymentRows[0];

      if (!latestPayment) {
        const error = new Error("Payment not found");
        error.status = 404;
        throw error;
      }

      const normalizedStatus = String(latestPayment.status || "").toLowerCase();

      if (!["success", "paid", "completed"].includes(normalizedStatus)) {
        const error = new Error("Payment must be successful before it can be completed");
        error.status = 400;
        throw error;
      }

      if (normalizedStatus !== "completed") {
        await connection.query(
          `UPDATE payments
           SET status = 'completed',
               paid_at = COALESCE(paid_at, NOW())
           WHERE id = ?`,
          [latestPayment.id]
        );
      }

      const [updatedRows] = await connection.query(
        `SELECT
          id,
          booking_id,
          amount,
          status,
          transaction_id,
          paid_at,
          created_at
        FROM payments
        WHERE id = ?
        LIMIT 1`,
        [latestPayment.id]
      );

      await connection.commit();

      const payment = updatedRows[0];
      return this.serializePayment(payment, "completed");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
    statuses = ["pending", "fixer_accept", "customer_accept", "arrived", "complete"]
  ) {
    const placeholders = statuses.map(() => "?").join(", ");

    const [rows] = await db.query(
      `SELECT
        b.id,
        b.customer_id,
        b.service_id,
        b.service_address,
        b.latitude,
        b.longitude,
        b.issue_description,
        b.urgent_level,
        b.status,
        b.service_fee,
        b.created_at,
        b.scheduled_at,
        sc.name AS category_name,
        fixer.full_name AS fixer_name,
        fixer.email AS fixer_email,
        fixer.phone AS fixer_phone,
        sp.company_name AS fixer_company_name,
        sp.location AS provider_location,
        sp.latitude AS provider_latitude,
        sp.longitude AS provider_longitude
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
        b.latitude,
        b.longitude,
        b.issue_description,
        b.urgent_level,
        b.status,
        b.service_fee,
        b.created_at,
        b.scheduled_at,
        sc.name AS category_name,
        fixer.full_name AS fixer_name,
        fixer.email AS fixer_email,
        fixer.phone AS fixer_phone,
        sp.company_name AS fixer_company_name,
        sp.location AS provider_location,
        sp.latitude AS provider_latitude,
        sp.longitude AS provider_longitude
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
         AND status = 'fixer_accept'`,
      [bookingId, customerId]
    );

    return result;
  }

  static async updateBookingLocationByCustomer(db, bookingId, customerId, payload) {
    const fields = ["latitude = ?", "longitude = ?"];
    const values = [payload.latitude, payload.longitude];

    if (Object.prototype.hasOwnProperty.call(payload, "service_address")) {
      fields.push("service_address = ?");
      values.push(payload.service_address);
    }

    values.push(bookingId, customerId);

    const [result] = await db.query(
      `UPDATE bookings
       SET ${fields.join(", ")}
       WHERE id = ?
         AND customer_id = ?
         AND status IN ('pending', 'fixer_accept', 'customer_accept', 'arrived')`,
      values
    );

    return result;
  }

  static async getFixerProfileBaseByBookingId(db, bookingId, customerId) {
    const [rows] = await db.query(
      `SELECT
        b.id AS booking_id,
        u.id AS fixer_user_id,
        sp.id AS provider_id,
        u.full_name,
        u.email,
        u.phone,
        u.profile_img,
        sp.company_name,
        sp.bio,
        sp.location,
        sp.latitude,
        sp.longitude,
        sp.experience,
        sp.is_verified,
        sp.speed_rating,
        sp.quality_rating,
        sp.price_fairness_rating,
        sp.behavior_rating,
        sp.overall_rating
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       INNER JOIN service_providers sp ON sp.id = s.provider_id
       INNER JOIN users u ON u.id = sp.user_id
       WHERE b.id = ?
         AND b.customer_id = ?
       LIMIT 1`,
      [bookingId, customerId]
    );

    return rows[0] || null;
  }

  static async getFixerCategoriesByProviderId(db, providerId) {
    const [rows] = await db.query(
      `SELECT DISTINCT sc.name
       FROM services s
       INNER JOIN service_categories sc ON sc.id = s.category_id
       WHERE s.provider_id = ?
       ORDER BY sc.name ASC`,
      [providerId]
    );

    return rows.map((row) => row.name).filter(Boolean);
  }

  static async getFixerBookingStatsByProviderId(db, providerId) {
    const [rows] = await db.query(
      `SELECT
        COUNT(DISTINCT b.id) AS total_bookings,
        COUNT(DISTINCT CASE
          WHEN b.status IN ('fixer_accept', 'customer_accept', 'arrived', 'complete')
          THEN b.id
        END) AS accepted_bookings,
        COUNT(DISTINCT CASE
          WHEN b.status = 'complete'
          THEN b.id
        END) AS completed_jobs
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       WHERE s.provider_id = ?`,
      [providerId]
    );

    return rows[0] || {
      total_bookings: 0,
      accepted_bookings: 0,
      completed_jobs: 0,
    };
  }

  static async getFixerReviewsByProviderId(db, providerId, limit = 6) {
    const safeLimit = Math.max(Number(limit) || 0, 0);
    const [rows] = await db.query(
      `SELECT
        r.id,
        r.overall_rating,
        r.comment,
        r.created_at,
        u.full_name AS customer_name
       FROM reviews r
       INNER JOIN bookings b ON b.id = r.booking_id
       INNER JOIN services s ON s.id = b.service_id
       INNER JOIN users u ON u.id = b.customer_id
       WHERE s.provider_id = ?
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [providerId, safeLimit]
    );

    return rows;
  }
}

module.exports = CustomerBooking;
