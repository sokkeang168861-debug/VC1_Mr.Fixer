const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/constants");

function getAllowedOrigins() {
  if (!process.env.FRONTEND_URL) {
    return ["http://localhost:5173"];
  }

  return [process.env.FRONTEND_URL, "http://localhost:5173"];
}

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      socket.user = jwt.verify(token, JWT_SECRET);
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }
  });

  return io;
}

function emitBookingUpdated(io, userId, booking) {
  if (!io || !userId || !booking) {
    return;
  }

  io.to(`user:${userId}`).emit("booking:updated", booking);
}

module.exports = {
  initSocketServer,
  emitBookingUpdated,
};
