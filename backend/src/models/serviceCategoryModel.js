class ServiceCategoryModel {

  static async createCategory(db, { name, description }) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO service_categories (name, description) VALUES (?, ?)",
        [name, description],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
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

  static updateCategory(db, id, { name, description }) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE service_categories SET name = ?, description = ? WHERE id = ?",
        [name, description, id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

}

module.exports = ServiceCategoryModel;