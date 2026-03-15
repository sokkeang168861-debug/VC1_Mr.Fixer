class ServiceCategoryModel {

  static async createCategory(db, { name, description, image }) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO service_categories (name, description, image) VALUES (?, ?, ?)",
        [name, description, image],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  static async getAllCategories(db) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id, name, description, image FROM service_categories ORDER BY id DESC",
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }

  static findCategory(db, name) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM service_categories WHERE name = ?",
        [name],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });
  }

  static async updateCategory(db, id, { name, description, image }) {
    return new Promise((resolve, reject) => {
      let sql;
      let values;
      if (image) {
        sql = `UPDATE service_categories SET name = ?, description = ?, image = ? WHERE id = ?`;
        values = [name, description, image, id];
      } else {
        sql = `UPDATE service_categories SET name = ?, description = ? WHERE id = ?`;
        values = [name, description, id];
      }
      db.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });

    });
  }

  static async deleteCategory(db, id) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM service_categories WHERE id = ?",
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  static async providersEachCategory(db, categoryId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
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
        WHERE sc.id = ?
      `;
      db.query(sql, [categoryId], (err, results) => {
        if (err) reject(err);
        else resolve(
          results.map(row => {
            if (row.profile_img && Buffer.isBuffer(row.profile_img)) {
              row.profile_img = `data:image/jpeg;base64,${row.profile_img.toString("base64")}`;
            }
            return row;
          })
        );
      });
    });
  }
}

module.exports = ServiceCategoryModel;