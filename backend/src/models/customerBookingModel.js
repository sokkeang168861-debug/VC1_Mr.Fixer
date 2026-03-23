class CustomerBooking {
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
          payload.urgent_level || "low",
          payload.status || "pending",
          payload.scheduled_at || null,
        ]
      );

      const imageValues = files
        .filter((file) => file?.buffer)
        .map((file) => [result.insertId, file.buffer]);

      if (imageValues.length > 0) {
        await connection.query(
          "INSERT INTO issue_img (booking_id, image) VALUES ?",
          [imageValues]
        );
      }

      await connection.commit();
      return result;
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
        COALESCE(payment_totals.amount, 0) AS amount
      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users u ON u.id = sp.user_id
      LEFT JOIN (
        SELECT
          booking_id,
          SUM(amount) AS amount
        FROM payments
        WHERE status IS NULL OR LOWER(status) IN ('paid', 'success', 'completed')
        GROUP BY booking_id
      ) AS payment_totals ON payment_totals.booking_id = b.id
      WHERE b.customer_id = ?
        AND LOWER(b.status) = 'complete'
      ORDER BY b.created_at DESC`,
      [customerId]
    );

    return rows.map((row) => {
      const historyItem = {
        ...row,
        amount: Number(row.amount || 0),
      };

      if (historyItem.fixer_avatar && Buffer.isBuffer(historyItem.fixer_avatar)) {
        historyItem.fixer_avatar = `data:image/jpeg;base64,${historyItem.fixer_avatar.toString("base64")}`;
      }

      return historyItem;
    });
  }
}

module.exports = CustomerBooking;
