class FixerDashboardModel {
  static async getRatingSummary(db, fixerId) {
    const [rows] = await db.query(
      `SELECT
        COALESCE(ROUND(AVG(r.quality_rating), 1), 0) AS quality_rating,
        COALESCE(ROUND(AVG(r.speed_rating), 1), 0) AS speed_rating,
        COALESCE(ROUND(AVG(r.price_fairness_rating), 1), 0) AS price_fairness_rating,
        COALESCE(ROUND(AVG(r.behavior_rating), 1), 0) AS behavior_rating,
        COALESCE(ROUND(AVG(r.overall_rating), 1), 0) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM reviews r
      INNER JOIN bookings b ON b.id = r.booking_id
      INNER JOIN services s ON s.id = b.service_id
      WHERE s.provider_id = ?`,
      [fixerId]
    );
    return rows[0];
  }

  static async getRecentFeedback(db, fixerId, limit = 5) {
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
        AND r.comment IS NOT NULL
        AND TRIM(r.comment) <> ''
      ORDER BY r.created_at DESC
      LIMIT ?`,
      [fixerId, Number(limit)]
    );
    return rows;
  }
}

module.exports = FixerDashboardModel;
