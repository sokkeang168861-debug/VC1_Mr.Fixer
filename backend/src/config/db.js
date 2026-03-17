require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mysql = require("mysql2/promise");

// A connection pool handles multiple simultaneous requests efficiently.
// mysql2/promise lets every query be a simple `await db.query(...)` call
// instead of nested callbacks — much easier to read and debug.
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mr_fixer_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
