require("dotenv").config();
const app = require("./app");
const db = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const bookingTimeoutService = require("./services/bookingTimeoutService");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify the database is reachable before accepting HTTP traffic.
    const connection = await db.getConnection();
    connection.release();
    console.log("Connected to MySQL!");

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL
          ? [process.env.FRONTEND_URL, "http://localhost:5173"]
          : ["http://localhost:5173"],
        methods: ["GET", "POST"]
      }
    });

    // Store io instance in app for use in controllers
    app.set("io", io);

    // Initialize booking timeout service
    bookingTimeoutService.init(io, db);

    // WebSocket connection handling
    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join user-specific room for notifications
      socket.on("join", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
      });

      // Leave room on disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down gracefully...');
      bookingTimeoutService.cleanup();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      bookingTimeoutService.cleanup();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
