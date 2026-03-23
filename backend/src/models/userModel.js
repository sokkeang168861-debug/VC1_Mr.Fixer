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
}

module.exports = User;

