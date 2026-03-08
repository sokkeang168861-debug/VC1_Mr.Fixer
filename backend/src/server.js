const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

// Test the database connection before starting the server.
// Using a pool prevents the app from crashing on transient errors like ECONNRESET.
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  console.log("Connected to MySQL!");
  connection.release();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});

