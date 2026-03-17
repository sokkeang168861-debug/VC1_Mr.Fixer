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

  static updatePasswordById(db, id, hashedPassword) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }


  static getBookingCategories(db) {
    const sql = `
      SELECT
        sc.id,
        sc.name,
        sc.description,
        sc.image,
        MIN(s.id) AS service_id
      FROM service_categories sc
      INNER JOIN services s ON s.category_id = sc.id
      WHERE sc.is_active = 1
        AND s.is_active = 1
      GROUP BY sc.id, sc.name, sc.description, sc.image
      ORDER BY sc.id ASC
    `;

    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static createBooking(db, payload) {
    const sql = `
      INSERT INTO bookings (
        customer_id,
        service_id,
        service_address,
        issue_description,
        status,
        scheduled_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      payload.customer_id,
      payload.service_id,
      payload.service_address || null,
      payload.issue_description,
      payload.status || "pending",
      payload.scheduled_at || null,
    ];

    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static getBookingsByCustomer(db, customerId) {
    const sql = `
      SELECT
        b.id,
        b.customer_id,
        b.service_id,
        b.service_address,
        b.issue_description,
        b.status,
        b.service_fee,
        b.proposed_price,
        b.final_price,
        b.cancellation_reason,
        b.created_at,
        b.updated_at,
        b.scheduled_at,
        sc.name AS category_name
      FROM bookings b
      LEFT JOIN services s ON s.id = b.service_id
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `;

    return new Promise((resolve, reject) => {
      db.query(sql, [customerId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

}

module.exports = User;
