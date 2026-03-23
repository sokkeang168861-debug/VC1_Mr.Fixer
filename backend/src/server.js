require("dotenv").config();
const http = require("http");
const app = require("./app");
const db = require("./config/db");
const { initSocketServer } = require("./realtime/socketServer");

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Verify the database is reachable before accepting HTTP traffic.
    const connection = await db.getConnection();
    connection.release();
    console.log("Connected to MySQL!");

    const server = http.createServer(app);
    const io = initSocketServer(server);
    app.set("io", io);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
