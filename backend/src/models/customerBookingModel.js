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

  static async getCustomerBookings(db, customerId) {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.status,
        b.issue_description,
        b.service_address,
        b.urgent_level,
        b.created_at,
        b.scheduled_at,
        b.service_fee,
        sc.name AS category_name,
        sp.company_name AS provider_name,
        u.full_name AS provider_full_name,
        sp.location AS provider_location
      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users u ON u.id = sp.user_id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
      LIMIT 50`,
      [customerId]
    );

    return rows.map((row) => {
      // Add human-readable status messages
      let statusMessage = row.status;
      switch (row.status) {
        case 'pending':
          statusMessage = 'Waiting for fixer response';
          break;
        case 'fixer_accept':
          statusMessage = 'Fixer accepted - awaiting your confirmation';
          break;
        case 'customer_accept':
          statusMessage = 'Confirmed - service scheduled';
          break;
        case 'fixer_reject':
          statusMessage = 'Fixer declined - find another fixer';
          break;
        case 'customer_reject':
          statusMessage = 'You cancelled this booking';
          break;
        case 'complete':
          statusMessage = 'Service completed';
          break;
        case 'missed':
          statusMessage = 'Request expired - find another fixer';
          break;
      }

      return {
        ...row,
        status_message: statusMessage
      };
    });
  }
}

module.exports = CustomerBooking;
