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
}

module.exports = User;