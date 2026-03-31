class ServiceCategoryModel {
  static async createCategory(db, { name, description, image }) {
    const [result] = await db.query(
      "INSERT INTO service_categories (name, description, image) VALUES (?, ?, ?)",
      [name, description, image]
    );
    return result;
  }

  static async getAllCategories(db) {
    const [rows] = await db.query(
      "SELECT id, name, description, image FROM service_categories ORDER BY id DESC"
    );
    return rows;
  }

  static async getAvailableCategories(db) {
    const [rows] = await db.query(
      `SELECT
        sc.id,
        sc.name,
        sc.description,
        ANY_VALUE(sc.image) AS image,
        COUNT(DISTINCT sp.id) AS pros_count
      FROM service_categories sc
      INNER JOIN services s ON s.category_id = sc.id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      INNER JOIN users u ON u.id = sp.user_id
      WHERE LOWER(u.role) = 'fixer'
      GROUP BY sc.id, sc.name, sc.description
      ORDER BY sc.id DESC`
    );
    return rows;
  }

  static async findCategory(db, name) {
    const [rows] = await db.query(
      "SELECT * FROM service_categories WHERE name = ?",
      [name]
    );
    return rows[0];
  }

  static async updateCategory(db, id, { name, description, image }) {
    if (image) {
      const [result] = await db.query(
        "UPDATE service_categories SET name = ?, description = ?, image = ? WHERE id = ?",
        [name, description, image, id]
      );
      return result;
    }

    const [result] = await db.query(
      "UPDATE service_categories SET name = ?, description = ? WHERE id = ?",
      [name, description, id]
    );
    return result;
  }

  static async deleteCategory(db, id) {
    const [result] = await db.query(
      "DELETE FROM service_categories WHERE id = ?",
      [id]
    );
    return result;
  }

  static async allProvidersByCategory(db, categoryId) {
    const [rows] = await db.query(
      `SELECT
        s.id AS service_id,
        sp.id AS provider_id,
        u.full_name,
        u.profile_img,
        u.email,
        u.phone,
        sp.company_name,
        sp.location,
        sp.latitude,
        sp.longitude
      FROM users u
      INNER JOIN service_providers sp ON sp.user_id = u.id
      INNER JOIN services s ON s.provider_id = sp.id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      WHERE sc.id = ?`,
      [categoryId]
    );
    return rows.map((row) => {
      if (row.profile_img && Buffer.isBuffer(row.profile_img)) {
        row.profile_img = `data:image/jpeg;base64,${row.profile_img.toString("base64")}`;
      }
      return row;
    });
  }

  static async nearProvidersByCategory(db, categoryId, latitude, longitude) {
    const [rows] = await db.query(
      `SELECT
        s.id AS service_id,
        sp.id AS provider_id,
        u.full_name,
        u.profile_img,
        u.email,
        u.phone,
        sp.company_name,
        sp.location,
        sp.latitude,
        sp.longitude,
        ROUND(
          6371 * ACOS(
            LEAST(
              1,
              COS(RADIANS(?)) * COS(RADIANS(sp.latitude)) * COS(RADIANS(sp.longitude) - RADIANS(?)) +
              SIN(RADIANS(?)) * SIN(RADIANS(sp.latitude))
            )
          ),
          2
        ) AS distance_km
      FROM users u
      INNER JOIN service_providers sp ON sp.user_id = u.id
      INNER JOIN services s ON s.provider_id = sp.id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      WHERE sc.id = ?
        AND sp.latitude IS NOT NULL
        AND sp.longitude IS NOT NULL
      ORDER BY distance_km ASC
      LIMIT 5`,
      [latitude, longitude, latitude, categoryId]
    );

    return rows.map((row) => {
      if (row.profile_img && Buffer.isBuffer(row.profile_img)) {
        row.profile_img = `data:image/jpeg;base64,${row.profile_img.toString("base64")}`;
      }
      return row;
    });
  }
}

module.exports = ServiceCategoryModel;
