require("dotenv").config();
const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify the database is reachable before accepting HTTP traffic.
    const connection = await db.getConnection();
    connection.release();
    console.log("Connected to MySQL!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
