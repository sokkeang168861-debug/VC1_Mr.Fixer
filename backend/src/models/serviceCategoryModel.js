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

  static async providersEachCategory(db, categoryId) {
    const [rows] = await db.query(
      `SELECT
        u.full_name,
        u.profile_img,
        u.email,
        u.phone,
        sp.company_name,
        sp.location
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
}

module.exports = ServiceCategoryModel;