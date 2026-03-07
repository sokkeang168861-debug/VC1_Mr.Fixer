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

  // static updateCategory(db, id, { name, description }) {
  //   return new Promise((resolve, reject) => {
  //     db.query(
  //       "UPDATE service_categories SET name = ?, description = ? WHERE id = ?",
  //       [name, description, id],
  //       (err, result) => {
  //         if (err) reject(err);
  //         else resolve(result);
  //       }
  //     );
  //   });
  // }

  static async updateCategory(db, id, { name, description, image }) {
    return new Promise((resolve, reject) => {

      let sql;
      let values;

      if (image) {
        sql = `
                UPDATE service_categories
                SET name = ?, description = ?, image = ?
                WHERE id = ?
            `;
        values = [name, description, image, id];
      } else {
        sql = `
                UPDATE service_categories
                SET name = ?, description = ?
                WHERE id = ?
            `;
        values = [name, description, id];
      }

      db.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });

    });
  }

}

module.exports = ServiceCategoryModel;