require("dotenv").config();
const mysql = require("mysql2");

// Common MySQL passwords to try in order
const passwordOptions = [
  process.env.DB_PASSWORD,
  "",
  "root",
  "password",
  "123456",
  "mysql",
  "admin",
  "test",
];

let currentPasswordIndex = 0;
let db = null;

function createConnectionWithRetry() {
  if (currentPasswordIndex >= passwordOptions.length) {
    console.error("\n❌ All password attempts failed!");
    console.log(
      "Please create a .env file in backend folder with your actual MySQL password:",
    );
    console.log("DB_PASSWORD=your_actual_mysql_password");
    process.exit(1);
  }

  const password = passwordOptions[currentPasswordIndex];
  const passwordDisplay =
    password === undefined ? "[ENV]" : password === "" ? "[EMPTY]" : password;

  console.log(`🔐 Trying password: ${passwordDisplay}`);

  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: password || "",
    database: process.env.DB_NAME || "mr_fixer_db",
  };

  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.log(`❌ Failed with: ${passwordDisplay}`);
      if (db) db.end();
      currentPasswordIndex++;
      createConnectionWithRetry();
    } else {
      console.log(`✅ SUCCESS! Connected with password: ${passwordDisplay}`);
      console.log(`📊 Database: ${dbConfig.database}`);
      console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);
    }
  });

  return db;
}

module.exports = createConnectionWithRetry();
