class FixerProfitModel {
  static async getTransactionsByFixerUserId(db, fixerUserId) {
    const [rows] = await db.query(
      `SELECT
        b.id AS booking_id,
        b.service_fee,
        b.created_at,
        u.full_name,
        COALESCE(payment_totals.amount_paid, 0) AS amount_paid
      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users u ON u.id = b.customer_id
      LEFT JOIN (
        SELECT
          booking_id,
          SUM(amount) AS amount_paid
        FROM payments
        WHERE status IS NULL OR LOWER(status) IN ('paid', 'success', 'completed')
        GROUP BY booking_id
      ) AS payment_totals ON payment_totals.booking_id = b.id
      WHERE sp.user_id = ?
        AND LOWER(b.status) = 'complete'
      ORDER BY b.created_at DESC, b.id DESC`,
      [fixerUserId]
    );

    return rows;
  }
}

module.exports = FixerProfitModel;
