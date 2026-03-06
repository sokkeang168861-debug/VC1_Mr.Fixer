const bcrypt = require("bcrypt");

class User {
  static getAllUsers(db, callback) {
    db.query("SELECT * FROM users", callback);
  }

  static async createUser(db, { full_name, phone, email, password }) {
    const hashed = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [full_name, phone, email, hashed, 'customer'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  static findByEmail(db, email) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
  static getAllCategories(db, callback) {
    db.query("SELECT * FROM service_categories", callback);
  }

static providersEachCategory(db, serviceCategory, callback) {
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

  db.query(sql, [serviceCategory], callback);
}

}

module.exports = User;