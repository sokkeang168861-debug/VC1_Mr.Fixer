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
          sp.company_name,
          sp.location,
          sp.experience,
          sp.bio,
          COALESCE(cat.categories, '') AS categories,
          COALESCE(cat.category_ids, '') AS category_ids,
          COALESCE(stats.total_bookings, 0) AS total_bookings,
          COALESCE(stats.avg_rating, sp.overall_rating, 0) AS overall_rating
        FROM users u
        LEFT JOIN service_providers sp ON sp.user_id = u.id
        LEFT JOIN (
          SELECT
            s.provider_id,
            GROUP_CONCAT(DISTINCT sc.name ORDER BY sc.name SEPARATOR ', ') AS categories,
            GROUP_CONCAT(DISTINCT sc.id ORDER BY sc.id SEPARATOR ',') AS category_ids
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
          LEFT JOIN bookings b
            ON b.service_id = s.id
           AND b.status = 'complete'
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
      companyName: row.company_name,
      location: row.location,
      experience: row.experience,
      bio: row.bio,
      categories: row.categories,
      categoryIds: (row.category_ids || "")
        .split(",")
        .map((id) => Number(id))
        .filter(Boolean),
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

  static async updateFixer(db, providerId, payload) {
    const {
      fullName,
      email,
      phone,
      companyName,
      location,
      experience,
      bio,
      categoryIds = [],
    } = payload;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [[provider]] = await connection.query(
        "SELECT id, user_id FROM service_providers WHERE id = ?",
        [providerId]
      );
      if (!provider) {
        await connection.rollback();
        return { found: false };
      }

      // Update user info
      await connection.query(
        `
          UPDATE users
          SET full_name = COALESCE(?, full_name),
              email = COALESCE(?, email),
              phone = COALESCE(?, phone)
          WHERE id = ?
        `,
        [fullName, email, phone, provider.user_id]
      );

      // Update provider info
      await connection.query(
        `
          UPDATE service_providers
          SET company_name = COALESCE(?, company_name),
              location = COALESCE(?, location),
              experience = COALESCE(?, experience),
              bio = COALESCE(?, bio)
          WHERE id = ?
        `,
        [companyName, location, experience, bio, providerId]
      );

      // Replace services (categories)
      if (Array.isArray(categoryIds)) {
        await connection.query("DELETE FROM services WHERE provider_id = ?", [
          providerId,
        ]);
        if (categoryIds.length > 0) {
          const values = categoryIds.map((cid) => [providerId, cid]);
          await connection.query(
            "INSERT INTO services (provider_id, category_id, is_active) VALUES ?",
            [values.map((v) => [...v, 1])]
          );
        }
      }

      await connection.commit();
      return { found: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteFixer(db, providerId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [[provider]] = await connection.query(
        "SELECT id, user_id FROM service_providers WHERE id = ?",
        [providerId]
      );

      if (!provider) {
        await connection.rollback();
        return { found: false };
      }

      // Delete services (cascade to bookings via FK)
      await connection.query("DELETE FROM services WHERE provider_id = ?", [
        providerId,
      ]);

      // Delete provider
      await connection.query(
        "DELETE FROM service_providers WHERE id = ?",
        [providerId]
      );

      // Delete user record (removes login)
      await connection.query("DELETE FROM users WHERE id = ?", [
        provider.user_id,
      ]);

      await connection.commit();
      return { found: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = FixerManagementModel;
