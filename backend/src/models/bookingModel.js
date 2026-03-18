class ProviderBooking {
  static async getAllrequest(db, current_provider_id) {
    const [rows] = await db.query(
      `SELECT
        b.id AS booking_id,
        sc.name AS category_name,
        b.issue_description,
        b.service_address,
        b.urgent_level,
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
      WHERE b.status = 'pending' AND s.provider_id = ?
      GROUP BY b.id
      ORDER BY b.id DESC
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
        sc.name AS category_name,
        b.issue_description,
        b.service_address,
        b.urgent_level,
        b.created_at,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        sp.location AS provider_location
      FROM bookings b
      INNER JOIN users u ON u.id = b.customer_id
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      WHERE b.id = ? AND s.provider_id = ?`,
      [booking_id, provider_id]
    );

    if (rows.length === 0) return null;

    const booking = rows[0];
    const [imageRows] = await db.query(
      "SELECT image FROM issue_img WHERE booking_id = ?",
      [booking_id]
    );
    booking.images = imageRows
      .filter((row) => row.image && Buffer.isBuffer(row.image))
      .map((row) => `data:image/jpeg;base64,${row.image.toString("base64")}`);

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
         SET b.status = 'fixer_accept', b.service_fee = ?
         WHERE b.id = ? AND s.provider_id = ?`,
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
}



class CustomerBooking {

  static async createBooking(db, payload) {
    const sql = `
      INSERT INTO bookings
        (
          customer_id,
          service_id,
          issue_description,
          service_address,
          latitude,
          longitude,
          urgent_level,
          status,
          scheduled_at
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      payload.customer_id,
      payload.service_id,
      payload.issue_description,
      payload.service_address || null,
      payload.latitude,
      payload.longitude,
      payload.urgent_level || "normal",
      payload.status || "pending",
      payload.scheduled_at || null,
    ]);

    return result;
  }

  static async getBookingsByCustomer(db, customerId) {
    const sql = `
      SELECT
        b.id, b.customer_id, b.service_id, b.service_address,
        b.issue_description, b.status, b.service_fee, b.proposed_price,
        b.final_price, b.cancellation_reason, b.created_at, b.updated_at,
        b.scheduled_at, sc.name AS category_name
      FROM bookings b
      LEFT JOIN services s ON s.id = b.service_id
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `;
    const [rows] = await db.query(sql, [customerId]);
    return rows;
  }
}

module.exports = { ProviderBooking, CustomerBooking };