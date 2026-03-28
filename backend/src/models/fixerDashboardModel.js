class FixerDashboardModel {
  static async getProviderIdByUserId(db, fixerUserId) {
    const [rows] = await db.query(
      `SELECT id
       FROM service_providers
       WHERE user_id = ?
       LIMIT 1`,
      [fixerUserId]
    );

    return rows[0]?.id || null;
  }

  static async getCompletedJobsCount(db, fixerId) {
    const [rows] = await db.query(
      `SELECT COUNT(DISTINCT b.id) AS completed_jobs
      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      WHERE sp.user_id = ?
        AND b.status = 'complete'`,
      [fixerId]
    );

    return Number(rows?.[0]?.completed_jobs || 0);
  }

  static async getTotalProfit(db, fixerId) {
    const [rows] = await db.query(
      `SELECT
        COALESCE(
          SUM(
            COALESCE(
              payment_totals.payment_amount,
              receipt_totals.receipt_amount,
              proposal_totals.proposal_amount,
              0
            )
          ),
          0
        ) AS total_profit
      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      LEFT JOIN (
        SELECT booking_id, SUM(amount) AS payment_amount
        FROM payments
        WHERE status IS NULL OR LOWER(status) IN ('paid', 'success', 'completed')
        GROUP BY booking_id
      ) AS payment_totals ON payment_totals.booking_id = b.id
      LEFT JOIN (
        SELECT booking_id, SUM(price) AS receipt_amount
        FROM receipt
        GROUP BY booking_id
      ) AS receipt_totals ON receipt_totals.booking_id = b.id
      LEFT JOIN (
        SELECT booking_id, SUM(price) AS proposal_amount
        FROM proposal_price
        GROUP BY booking_id
      ) AS proposal_totals ON proposal_totals.booking_id = b.id
      WHERE sp.user_id = ?
        AND b.status = 'complete'`,
      [fixerId]
    );
    return Number(rows?.[0]?.total_profit || 0);
  }

  static async getRatingSummary(db, providerId) {
    if (!providerId) {
      return {
        quality_rating: 0,
        speed_rating: 0,
        price_fairness_rating: 0,
        behavior_rating: 0,
        overall_rating: 0,
        total_ratings: 0,
      };
    }

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
      [providerId]
    );

    return rows[0] || {
      quality_rating: 0,
      speed_rating: 0,
      price_fairness_rating: 0,
      behavior_rating: 0,
      overall_rating: 0,
      total_ratings: 0,
    };
  }

  static async getRecentFeedback(db, providerId, limit = 5) {
    if (!providerId) {
      return [];
    }

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
      ORDER BY r.created_at DESC`,
      [providerId]
    );

    return rows.slice(0, Math.max(Number(limit) || 0, 0));
  }

  static async getProviderCategories(db, providerId) {
    if (!providerId) {
      return [];
    }

    const [rows] = await db.query(
      `SELECT DISTINCT sc.id, sc.name
       FROM services s
       INNER JOIN service_categories sc ON sc.id = s.category_id
       WHERE s.provider_id = ?
       ORDER BY sc.name ASC`,
      [providerId]
    );

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name || "",
    }));
  }
}

module.exports = FixerDashboardModel;
