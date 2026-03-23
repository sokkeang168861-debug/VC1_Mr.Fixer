const bcrypt = require("bcrypt");

class User {
  static async getAllUsers(db) {
    const [rows] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        CASE WHEN u.is_active = 1 THEN 'Active' ELSE 'Suspended' END AS status,
        COALESCE(COUNT(b.id), 0) AS total_bookings,
        u.created_at
      FROM users u
      LEFT JOIN bookings b ON b.customer_id = u.id
      WHERE LOWER(u.role) = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC`
    );
    return rows;
  }

  static async getAdminUsers(db) {
    // Admin users list is meant to include only customer users (same as getAllUsers)
    return await this.getAllUsers(db);
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

  static async findByEmailExcludingId(db, email, excludedId) {
    const [rows] = await db.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id <> ? LIMIT 1",
      [email, excludedId]
    );
    return rows[0] || null;
  }

  static async findById(db, id) {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone, role, profile_img FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  }

  static async findAuthById(db, id) {
    const [rows] = await db.query(
      "SELECT id, email, password, role, full_name FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  }

  static async findCustomerProfileById(db, id) {
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, role, profile_img
       FROM users
       WHERE id = ? AND LOWER(role) = 'customer'
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async getCustomerById(db, id) {
    const [rows] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        CASE WHEN u.is_active = 1 THEN 'Active' ELSE 'Suspended' END AS status,
        COALESCE(COUNT(b.id), 0) AS total_bookings,
        u.created_at
      FROM users u
      LEFT JOIN bookings b ON b.customer_id = u.id
      WHERE u.id = ? AND LOWER(u.role) = 'customer'
      GROUP BY u.id
      LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findServiceProviderLocationByUserId(db, userId) {
    const [rows] = await db.query(
      `SELECT id, user_id, location
       FROM service_providers
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    return rows[0] || null;
  }

  static async updateCustomerProfileById(db, id, payload) {
    const fields = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(payload, "full_name")) {
      fields.push("full_name = ?");
      values.push(payload.full_name);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "email")) {
      fields.push("email = ?");
      values.push(payload.email);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "phone")) {
      fields.push("phone = ?");
      values.push(payload.phone);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "profile_img")) {
      fields.push("profile_img = ?");
      values.push(payload.profile_img);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const [result] = await db.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = ? AND LOWER(role) = 'customer'`,
      values
    );

    return result;
  }

  static async updateServiceProviderLocationByUserId(db, userId, location) {
    const [result] = await db.query(
      `UPDATE service_providers
       SET location = ?
       WHERE user_id = ?`,
      [location, userId]
    );

    return result;
  }

  static async createServiceProviderLocationByUserId(db, userId, location) {
    const [result] = await db.query(
      `INSERT INTO service_providers (user_id, location)
       VALUES (?, ?)`,
      [userId, location]
    );

    return result;
  }

  static async updatePasswordById(db, id, hashedPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedPassword, id]
    );
    return result;
  }
}

module.exports = User;

