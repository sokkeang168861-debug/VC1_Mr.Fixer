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
}, 3000); // Give time for connection retries
