class FixerBookingModel {
  static mapImageRows(imageRows) {
    return imageRows
      .filter((row) => row.image && Buffer.isBuffer(row.image))
      .map((row) => `data:image/jpeg;base64,${row.image.toString("base64")}`);
  }

  static async getAllrequest(db, current_provider_id) {
    const [rows] = await db.query(
      `SELECT
        b.id AS booking_id,
        COALESCE(sc.name, '') AS category_name,
        b.issue_description,
        b.service_address,
        b.urgent_level,
        b.status,
        COALESCE(b.service_fee, 0) AS service_fee,
        latest_payment.status AS payment_status,
        b.created_at,
        u.full_name AS customer_name,
        sp.location AS provider_location,
        MIN(ii.image) AS issue_image
      FROM bookings b
      INNER JOIN users u ON u.id = b.customer_id
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      LEFT JOIN issue_img ii ON ii.booking_id = b.id
      LEFT JOIN (
        SELECT p1.booking_id, p1.status
        FROM payments p1
        INNER JOIN (
          SELECT booking_id, MAX(id) AS latest_id
          FROM payments
          GROUP BY booking_id
        ) latest ON latest.latest_id = p1.id
      ) latest_payment ON latest_payment.booking_id = b.id
      WHERE (
          b.status IN ('pending', 'fixer_accept', 'customer_accept', 'arrived')
          OR (
            b.status = 'complete'
            AND COALESCE(LOWER(latest_payment.status), 'pending') <> 'completed'
          )
        )
        AND sp.user_id = ?
      GROUP BY b.id
      ORDER BY
        CASE
          WHEN b.status = 'complete' THEN 0
          WHEN b.status = 'arrived' THEN 1
          WHEN b.status = 'customer_accept' THEN 2
          WHEN b.status = 'fixer_accept' THEN 3
          WHEN b.status = 'pending' THEN 4
          ELSE 5
        END,
        b.id DESC
      LIMIT 50`,
      [current_provider_id]
    );

    return rows.map((row) => {
      if (row.issue_image && Buffer.isBuffer(row.issue_image)) {
        row.issue_image = `data:image/jpeg;base64,${row.issue_image.toString("base64")}`;
      }
      return row;
    });
  }

  static async getById(db, booking_id, provider_id) {
    const [rows] = await db.query(
      `SELECT
        b.id AS booking_id,
        COALESCE(sc.name, '') AS category_name,
        b.issue_description,
        b.service_address,
        b.latitude,
        b.longitude,
        b.urgent_level,
        COALESCE(b.service_fee, 0) AS service_fee,
        COALESCE(pp.proposal_total, b.service_fee, 0) AS proposal_total,
        COALESCE(rt.receipt_total, 0) AS receipt_total,
        latest_payment.id AS payment_id,
        latest_payment.amount AS payment_amount,
        latest_payment.payment_method,
        latest_payment.status AS payment_status,
        latest_payment.transaction_id,
        latest_payment.paid_at AS payment_paid_at,
        b.status,
        b.created_at,
        customer.full_name AS customer_name,
        customer.phone AS customer_phone,
        customer.email AS customer_email,
        fixer.full_name AS fixer_name,
        sp.company_name AS fixer_company_name,
        sp.location AS provider_location,
        sp.latitude AS provider_latitude,
        sp.longitude AS provider_longitude
      FROM bookings b
      INNER JOIN users customer ON customer.id = b.customer_id
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users fixer ON fixer.id = sp.user_id
      LEFT JOIN (
        SELECT booking_id, SUM(price) AS proposal_total
        FROM proposal_price
        GROUP BY booking_id
      ) pp ON pp.booking_id = b.id
      LEFT JOIN (
        SELECT booking_id, SUM(price) AS receipt_total
        FROM receipt
        GROUP BY booking_id
      ) rt ON rt.booking_id = b.id
      LEFT JOIN (
        SELECT
          p1.id,
          p1.booking_id,
          p1.amount,
          p1.payment_method,
          p1.status,
          p1.transaction_id,
          p1.paid_at
        FROM payments p1
        INNER JOIN (
          SELECT booking_id, MAX(id) AS latest_id
          FROM payments
          GROUP BY booking_id
        ) latest ON latest.latest_id = p1.id
      ) latest_payment ON latest_payment.booking_id = b.id
      WHERE b.id = ? AND sp.user_id = ?`,
      [booking_id, provider_id]
    );

    if (rows.length === 0) return null;

    const booking = rows[0];
    const [imageRows] = await db.query(
      "SELECT image FROM issue_img WHERE booking_id = ?",
      [booking_id]
    );
    booking.images = FixerBookingModel.mapImageRows(imageRows);

    const [receiptRows] = await db.query(
      `SELECT id, name, price
       FROM receipt
       WHERE booking_id = ?
       ORDER BY id ASC`,
      [booking_id]
    );
    booking.receipt_items = receiptRows.map((item) => ({
      id: Number(item.id),
      name: item.name || "",
      price:
        item.price !== null && item.price !== undefined
          ? Number(item.price)
          : 0,
    }));
    booking.receipt_total =
      booking.receipt_total !== null && booking.receipt_total !== undefined
        ? Number(booking.receipt_total)
        : 0;
    booking.payment =
      booking.payment_id !== null && booking.payment_id !== undefined
        ? {
            id: Number(booking.payment_id),
            amount:
              booking.payment_amount !== null && booking.payment_amount !== undefined
                ? Number(booking.payment_amount)
                : 0,
            payment_method: booking.payment_method || null,
            status: booking.payment_status || "pending",
            transaction_id: booking.transaction_id || null,
            paid_at: booking.payment_paid_at || null,
          }
        : null;

    return booking;
  }

  static async acceptAndSetProposal(db, booking_id, provider_id, items, total) {
    // A transaction ensures both the status update and proposal insert
    // succeed together, or both are rolled back on error.
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        `UPDATE bookings b
         INNER JOIN services s ON s.id = b.service_id
         INNER JOIN service_providers sp ON sp.id = s.provider_id
         SET b.status = 'fixer_accept', b.service_fee = ?
         WHERE b.id = ? AND sp.user_id = ?`,
        [total, booking_id, provider_id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Booking not found or not owned by provider");
      }

      if (items && items.length > 0) {
        const values = items.map((item) => [booking_id, item.name, item.price]);
        await connection.query(
          "INSERT INTO proposal_price (booking_id, name, price) VALUES ?",
          [values]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async markArrived(db, booking_id, provider_id) {
    const [result] = await db.query(
      `UPDATE bookings b
       INNER JOIN services s ON s.id = b.service_id
       INNER JOIN service_providers sp ON sp.id = s.provider_id
       SET b.status = 'arrived'
       WHERE b.id = ?
         AND sp.user_id = ?
         AND b.status = 'customer_accept'`,
      [booking_id, provider_id]
    );

    return result;
  }

  static async completeBooking(db, booking_id, provider_id, items, total) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [bookingRows] = await connection.query(
        `SELECT
           b.id,
           b.customer_id,
           b.status
         FROM bookings b
         INNER JOIN services s ON s.id = b.service_id
         INNER JOIN service_providers sp ON sp.id = s.provider_id
         WHERE b.id = ?
           AND sp.user_id = ?
         LIMIT 1
         FOR UPDATE`,
        [booking_id, provider_id]
      );

      const booking = bookingRows[0];

      if (!booking) {
        const error = new Error("Booking not found or not owned by provider");
        error.status = 404;
        throw error;
      }

      const normalizedStatus = String(booking.status || "").toLowerCase();
      if (!["arrived", "complete"].includes(normalizedStatus)) {
        const error = new Error("Booking must be arrived before it can be completed");
        error.status = 400;
        throw error;
      }

      await connection.query("DELETE FROM receipt WHERE booking_id = ?", [
        booking_id,
      ]);

      if (items.length > 0) {
        const values = items.map((item) => [booking_id, item.name, item.price]);
        await connection.query(
          "INSERT INTO receipt (booking_id, name, price) VALUES ?",
          [values]
        );
      }

      await connection.query(
        `UPDATE bookings
         SET status = 'complete',
             service_fee = ?
         WHERE id = ?`,
        [total, booking_id]
      );

      const [paymentRows] = await connection.query(
        `SELECT
           id,
           status
         FROM payments
         WHERE booking_id = ?
         ORDER BY id DESC
         LIMIT 1
         FOR UPDATE`,
        [booking_id]
      );

      const latestPayment = paymentRows[0];
      const transactionId = `PENDING-${booking_id}-${Date.now()}`;

      if (!latestPayment) {
        await connection.query(
          `INSERT INTO payments (
             booking_id,
             amount,
             payment_method,
             status,
             transaction_id,
             paid_at,
             created_at
           ) VALUES (?, ?, ?, 'pending', ?, NULL, NOW())`,
          [booking_id, total, null, transactionId]
        );
      } else if (String(latestPayment.status || "").toLowerCase() === "pending") {
        await connection.query(
          `UPDATE payments
           SET amount = ?,
               transaction_id = COALESCE(transaction_id, ?)
           WHERE id = ?`,
          [total, transactionId, latestPayment.id]
        );
      }

      await connection.commit();

      return {
        booking_id: Number(booking_id),
        customer_id: Number(booking.customer_id),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async markPaymentPaid(db, booking_id, provider_id) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [bookingRows] = await connection.query(
        `SELECT
           b.id
         FROM bookings b
         INNER JOIN services s ON s.id = b.service_id
         INNER JOIN service_providers sp ON sp.id = s.provider_id
         WHERE b.id = ?
           AND sp.user_id = ?
           AND b.status = 'complete'
         LIMIT 1
         FOR UPDATE`,
        [booking_id, provider_id]
      );

      if (!bookingRows[0]) {
        const error = new Error("Completed booking not found or not owned by provider");
        error.status = 404;
        throw error;
      }

      const [paymentRows] = await connection.query(
        `SELECT
           id,
           booking_id,
           amount,
           payment_method,
           status,
           transaction_id,
           paid_at,
           created_at
         FROM payments
         WHERE booking_id = ?
         ORDER BY id DESC
         LIMIT 1
         FOR UPDATE`,
        [booking_id]
      );

      const latestPayment = paymentRows[0];

      if (!latestPayment) {
        const error = new Error("Payment not found");
        error.status = 404;
        throw error;
      }

      const normalizedStatus = String(latestPayment.status || "").toLowerCase();

      if (normalizedStatus !== "paid") {
        await connection.query(
          `UPDATE payments
           SET status = 'paid',
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
           payment_method,
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
      return updatedRows[0] || null;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async markPaymentCompleted(db, booking_id, provider_id) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [bookingRows] = await connection.query(
        `SELECT
           b.id
         FROM bookings b
         INNER JOIN services s ON s.id = b.service_id
         INNER JOIN service_providers sp ON sp.id = s.provider_id
         WHERE b.id = ?
           AND sp.user_id = ?
           AND b.status = 'complete'
         LIMIT 1
         FOR UPDATE`,
        [booking_id, provider_id]
      );

      if (!bookingRows[0]) {
        const error = new Error("Completed booking not found or not owned by provider");
        error.status = 404;
        throw error;
      }

      const [paymentRows] = await connection.query(
        `SELECT
           id,
           booking_id,
           amount,
           payment_method,
           status,
           transaction_id,
           paid_at,
           created_at
         FROM payments
         WHERE booking_id = ?
         ORDER BY id DESC
         LIMIT 1
         FOR UPDATE`,
        [booking_id]
      );

      const latestPayment = paymentRows[0];

      if (!latestPayment) {
        const error = new Error("Payment not found");
        error.status = 404;
        throw error;
      }

      const normalizedStatus = String(latestPayment.status || "").toLowerCase();

      if (!["paid", "completed"].includes(normalizedStatus)) {
        const error = new Error("Payment must be paid before it can be completed");
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
           payment_method,
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
      return updatedRows[0] || null;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = FixerBookingModel;
