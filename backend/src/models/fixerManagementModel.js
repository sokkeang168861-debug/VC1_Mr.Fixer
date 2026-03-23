class FixerManagementModel {
  static async providerCoordinateColumnsExist(queryable) {
    const [latitudeRows] = await queryable.query(
      "SHOW COLUMNS FROM service_providers LIKE 'latitude'"
    );
    const [longitudeRows] = await queryable.query(
      "SHOW COLUMNS FROM service_providers LIKE 'longitude'"
    );
    return latitudeRows.length > 0 && longitudeRows.length > 0;
  }

  /**
   * Returns fixers (users with role "fixer") along with:
   * - provider id
   * - categories they serve (comma-separated)
   * - total bookings handled
   * - overall rating (avg of reviews.overall_rating, fallback to service_providers.overall_rating)
   */
  static async getFixersWithStats(db) {
    const hasCoordinateColumns = await this.providerCoordinateColumnsExist(db);
    const coordinateSelection = hasCoordinateColumns
      ? "sp.latitude, sp.longitude,"
      : "NULL AS latitude, NULL AS longitude,";

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
          ${coordinateSelection}
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
      latitude:
        row.latitude === null || row.latitude === undefined
          ? null
          : Number(row.latitude),
      longitude:
        row.longitude === null || row.longitude === undefined
          ? null
          : Number(row.longitude),
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

  static async createFixer(db, payload) {
    const {
      fullName,
      email,
      phone,
      profileImg,
      hashedPassword,
      companyName,
      location,
      latitude,
      longitude,
      experience,
      bio,
      categoryIds = [],
    } = payload;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const hasCoordinateColumns = await this.providerCoordinateColumnsExist(
        connection
      );

      const [userResult] = await connection.query(
        `
          INSERT INTO users (full_name, email, phone, password, role, profile_img)
          VALUES (?, ?, ?, ?, 'fixer', ?)
        `,
        [fullName, email, phone, hashedPassword, profileImg]
      );

      const userId = userResult.insertId;

      let providerResult;
      if (hasCoordinateColumns) {
        [providerResult] = await connection.query(
          `
            INSERT INTO service_providers (user_id, company_name, location, latitude, longitude, experience, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [userId, companyName, location, latitude, longitude, experience, bio]
        );
      } else {
        [providerResult] = await connection.query(
          `
            INSERT INTO service_providers (user_id, company_name, location, experience, bio)
            VALUES (?, ?, ?, ?, ?)
          `,
          [userId, companyName, location, experience, bio]
        );
      }

      const providerId = providerResult.insertId;

      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const values = categoryIds.map((categoryId) => [
          providerId,
          categoryId,
          1,
        ]);
        await connection.query(
          "INSERT INTO services (provider_id, category_id, is_active) VALUES ?",
          [values]
        );
      }

      await connection.commit();
      return { userId, providerId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateFixer(db, providerId, payload) {
    const {
      fullName,
      email,
      phone,
      profileImg,
      companyName,
      location,
      latitude,
      longitude,
      experience,
      bio,
      categoryIds = [],
    } = payload;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const hasCoordinateColumns = await this.providerCoordinateColumnsExist(
        connection
      );

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
              phone = COALESCE(?, phone),
              profile_img = COALESCE(?, profile_img)
          WHERE id = ?
        `,
        [fullName, email, phone, profileImg, provider.user_id]
      );

      // Update provider info
      if (hasCoordinateColumns) {
        await connection.query(
          `
            UPDATE service_providers
            SET company_name = COALESCE(?, company_name),
                location = COALESCE(?, location),
                latitude = COALESCE(?, latitude),
                longitude = COALESCE(?, longitude),
                experience = COALESCE(?, experience),
                bio = COALESCE(?, bio)
            WHERE id = ?
          `,
          [companyName, location, latitude, longitude, experience, bio, providerId]
        );
      } else {
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
      }

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
    const runQueryIgnoreMissingTable = async (sql, params = []) => {
      try {
        await connection.query(sql, params);
      } catch (error) {
        if (error?.code !== "ER_NO_SUCH_TABLE") {
          throw error;
        }
      }
    };

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

      const [serviceRows] = await connection.query(
        "SELECT id FROM services WHERE provider_id = ?",
        [providerId]
      );
      const serviceIds = serviceRows
        .map((row) => Number(row.id))
        .filter((id) => Number.isFinite(id));

      if (serviceIds.length > 0) {
        await runQueryIgnoreMissingTable(
          `
            DELETE pp
            FROM proposal_price pp
            INNER JOIN bookings b ON b.id = pp.booking_id
            WHERE b.service_id IN (?)
          `,
          [serviceIds]
        );

        await runQueryIgnoreMissingTable(
          `
            DELETE rc
            FROM receipt rc
            INNER JOIN bookings b ON b.id = rc.booking_id
            WHERE b.service_id IN (?)
          `,
          [serviceIds]
        );

        await runQueryIgnoreMissingTable(
          `
            DELETE rv
            FROM reviews rv
            INNER JOIN bookings b ON b.id = rv.booking_id
            WHERE b.service_id IN (?)
          `,
          [serviceIds]
        );

        await runQueryIgnoreMissingTable(
          `
            DELETE pm
            FROM payments pm
            INNER JOIN bookings b ON b.id = pm.booking_id
            WHERE b.service_id IN (?)
          `,
          [serviceIds]
        );

        await runQueryIgnoreMissingTable(
          `
            DELETE ii
            FROM issue_img ii
            INNER JOIN bookings b ON b.id = ii.booking_id
            WHERE b.service_id IN (?)
          `,
          [serviceIds]
        );

        await runQueryIgnoreMissingTable(
          "DELETE FROM bookings WHERE service_id IN (?)",
          [serviceIds]
        );
      }

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
