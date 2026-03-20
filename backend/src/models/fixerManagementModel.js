class FixerManagementModel {
  /**
   * Returns fixers (users with role "fixer") along with:
   * - provider id
   * - categories they serve (comma-separated)
   * - total bookings handled
   * - overall rating (avg of reviews.overall_rating, fallback to service_providers.overall_rating)
   */
  static async getFixersWithStats(db) {
    const [rows] = await db.query(
      `
        SELECT
          u.id AS user_id,
          sp.id AS provider_id,
          u.full_name,
          u.email,
          u.phone,
          u.profile_img,
          COALESCE(cat.categories, '') AS categories,
          COALESCE(stats.total_bookings, 0) AS total_bookings,
          COALESCE(stats.avg_rating, sp.overall_rating, 0) AS overall_rating
        FROM users u
        INNER JOIN service_providers sp ON sp.user_id = u.id
        LEFT JOIN (
          SELECT
            s.provider_id,
            GROUP_CONCAT(DISTINCT sc.name ORDER BY sc.name SEPARATOR ', ') AS categories
          FROM services s
          LEFT JOIN service_categories sc ON sc.id = s.category_id
          GROUP BY s.provider_id
        ) AS cat ON cat.provider_id = sp.id
        LEFT JOIN (
          SELECT
            s.provider_id,
            COUNT(DISTINCT b.id) AS total_bookings,
            ROUND(AVG(r.overall_rating), 1) AS avg_rating
          FROM services s
          LEFT JOIN bookings b ON b.service_id = s.id
          LEFT JOIN reviews r ON r.booking_id = b.id
          GROUP BY s.provider_id
        ) AS stats ON stats.provider_id = sp.id
        WHERE LOWER(u.role) = 'fixer'
        ORDER BY total_bookings DESC, u.full_name ASC
      `
    );

    return rows.map((row) => ({
      userId: row.user_id,
      providerId: row.provider_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      categories: row.categories,
      totalBookings: Number(row.total_bookings || 0),
      overallRating:
        row.overall_rating === null || row.overall_rating === undefined
          ? 0
          : Number(row.overall_rating),
      avatar:
        row.profile_img && Buffer.isBuffer(row.profile_img)
          ? `data:image/jpeg;base64,${row.profile_img.toString("base64")}`
          : null,
    }));
  }
}

module.exports = FixerManagementModel;
