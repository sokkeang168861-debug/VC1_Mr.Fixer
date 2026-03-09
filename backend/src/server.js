const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

// Wait for database connection to be established
setTimeout(() => {
  if (db.state === "authenticated") {
    console.log("🚀 Server starting...");
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } else {
    console.log("❌ Database connection not established. Server not started.");
  }
}, 5000); // Give time for connection retries
// Test the database connection before starting the server.
// Using a pool prevents the app from crashing on transient errors like ECONNRESET.
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  console.log("Connected to MySQL!");
  
  // Set the packet limit for the current connection session to handle large blobs
  connection.query("SET GLOBAL max_allowed_packet = 67108864", (err) => {
    if (err) {
      console.warn("Could not set GLOBAL max_allowed_packet automatically. Error:", err.message);
      console.warn("If you still get ER_NET_PACKET_TOO_LARGE, run this manually in MySQL: SET GLOBAL max_allowed_packet = 67108864;");
    } else {
      console.log("MySQL max_allowed_packet increased to 64MB");
    }
  });

  connection.release();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});

