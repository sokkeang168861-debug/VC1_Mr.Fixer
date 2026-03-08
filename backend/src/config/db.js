require("dotenv").config();
const mysql = require("mysql2");

// Common MySQL passwords to try in order (phpMyAdmin friendly)
const passwordOptions = [
  process.env.DB_PASSWORD,
  "", // Most common for phpMyAdmin
  "root",
  "password",
  "123456",
  "mysql",
  "admin",
  "test",
];
// Use a connection pool so MySQL errors (like ECONNRESET) don't crash the app.
// Pools automatically manage reconnects and provide a clean API for queries.
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mr_fixer_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let currentPasswordIndex = 0;
let db = null;

function createConnectionWithRetry() {
  if (currentPasswordIndex >= passwordOptions.length) {
    console.error("\n❌ All password attempts failed!");
    console.log("For phpMyAdmin setups, try these solutions:");
    console.log("1. Create .env file with: DB_PASSWORD=");
    console.log("2. Create .env file with: DB_PASSWORD=root");
    console.log("3. Check your phpMyAdmin login password");
    process.exit(1);
  }

  const password = passwordOptions[currentPasswordIndex];
  const passwordDisplay =
    password === undefined ? "[ENV]" : password === "" ? "[EMPTY]" : password;

  console.log(`🔐 Trying password: ${passwordDisplay}`);

  // Try both common MySQL ports for phpMyAdmin
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306, // Try 3306 first (phpMyAdmin default)
    user: process.env.DB_USER || "root",
    password: password || "",
    database: process.env.DB_NAME || "mr_fixer_db",
  };

  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.log(`❌ Failed with: ${passwordDisplay}`);
      if (db) {
        try {
          db.end();
        } catch (e) {
          // Ignore end errors
        }
      }
      currentPasswordIndex++;
      // Add delay before retry
      setTimeout(() => {
        createConnectionWithRetry();
      }, 1000);
    } else {
      console.log(`✅ SUCCESS! Connected with password: ${passwordDisplay}`);
      console.log(`📊 Database: ${dbConfig.database}`);
      console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);
    }
  });

  return db;
}

module.exports = createConnectionWithRetry();
