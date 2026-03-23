class CustomerBooking {
  static mapBookingRow(row, proposalItems = []) {
    if (!row) {
      return null;
    }

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
      service_fee: row.service_fee !== null && row.service_fee !== undefined
        ? Number(row.service_fee)
        : null,
      category_name: row.category_name || "",
      fixer_name: row.fixer_name || "",
      fixer_email: row.fixer_email || "",
      fixer_phone: row.fixer_phone || "",
      proposal_items: proposalItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
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

    const booking = rows[0] || null;
    if (!booking) {
      return null;
    }

    return this.getBookingDetailsById(db, booking.id, customerId);
  }

  static async getBookingDetailsById(db, bookingId, customerId = null) {
    const values = [bookingId];
    const customerFilter = customerId ? "AND b.customer_id = ?" : "";

    if (customerId) {
      values.push(customerId);
    }

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

    const booking = rows[0] || null;
    if (!booking) {
      return null;
    }

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
}

module.exports = CustomerBooking;
