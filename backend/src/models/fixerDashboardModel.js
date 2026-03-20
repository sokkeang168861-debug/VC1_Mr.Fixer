class FixerDashboardModel {
  static getRatingSummary(db, fixerId) {
    const query = `
      SELECT
        COALESCE(ROUND(AVG(r.quality_rating), 1), 0) AS quality_rating,
        COALESCE(ROUND(AVG(r.speed_rating), 1), 0) AS speed_rating,
        COALESCE(ROUND(AVG(r.price_fairness_rating), 1), 0) AS price_fairness_rating,
        COALESCE(ROUND(AVG(r.behavior_rating), 1), 0) AS behavior_rating,
        COALESCE(ROUND(AVG(r.overall_rating), 1), 0) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM reviews r
      INNER JOIN bookings b ON b.id = r.booking_id
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      WHERE sp.user_id = ?
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [fixerId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  static getRecentFeedback(db, fixerId, limit = 5) {
    const query = `
      SELECT
        r.id,
        r.overall_rating,
        r.comment,
        r.created_at,
        u.full_name AS customer_name
      FROM reviews r
      INNER JOIN bookings b ON b.id = r.booking_id
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users u ON u.id = b.customer_id
      WHERE sp.user_id = ?
        AND r.comment IS NOT NULL
        AND TRIM(r.comment) <> ''
      ORDER BY r.created_at DESC
      LIMIT ?
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [fixerId, Number(limit)], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = FixerDashboardModel;
