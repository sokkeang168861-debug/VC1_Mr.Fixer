const mysql = require("mysql2");
const path = require("path");

// Load .env from the backend root directory to ensure it works in all contexts
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Use a connection pool so MySQL errors (like ECONNRESET) don't crash the app.
// Pools automatically manage reconnects and provide a clean API for queries.
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
