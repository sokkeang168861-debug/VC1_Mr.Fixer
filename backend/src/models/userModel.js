const bcrypt = require("bcrypt");

class User {
  static async getAllUsers(db) {
    const [rows] = await db.query("SELECT * FROM users");
    return rows;
  }

  static async createUser(db, { full_name, phone, email, password }) {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, phone, email, hashed, "customer"]
    );
    return result;
  }

  static async findByEmail(db, email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  static async findById(db, id) {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone, role, profile_img FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  }

  static async updatePasswordById(db, id, hashedPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );
    return result;
  }

  static async getBookingCategories(db) {
    const sql = `
      SELECT
        sc.id,
        sc.name,
        sc.description,
        sc.image,
        MIN(s.id) AS service_id
      FROM service_categories sc
      INNER JOIN services s ON s.category_id = sc.id
      WHERE sc.is_active = 1 AND s.is_active = 1
      GROUP BY sc.id, sc.name, sc.description, sc.image
      ORDER BY sc.id ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async createBooking(db, payload) {
    const sql = `
      INSERT INTO bookings
        (customer_id, service_id, service_address, issue_description, status, scheduled_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      payload.customer_id,
      payload.service_id,
      payload.service_address || null,
      payload.issue_description,
      payload.status || "pending",
      payload.scheduled_at || null,
    ]);
    return result;
  }

  static async getBookingsByCustomer(db, customerId) {
    const sql = `
      SELECT
        b.id, b.customer_id, b.service_id, b.service_address,
        b.issue_description, b.status, b.service_fee, b.proposed_price,
        b.final_price, b.cancellation_reason, b.created_at, b.updated_at,
        b.scheduled_at, sc.name AS category_name
      FROM bookings b
      LEFT JOIN services s ON s.id = b.service_id
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `;
    const [rows] = await db.query(sql, [customerId]);
    return rows;
  }
}

module.exports = User;

