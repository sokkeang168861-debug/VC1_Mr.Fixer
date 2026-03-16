const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const providerRoutes = require("./routes/providerRoutes");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5174"],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  console.log(`[${req.requestId}] ${req.method} ${req.url} (${contentType})`);

  if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
    console.log(`[${req.requestId}] Body:`, req.body);
  }

  res.on("finish", () => {
    console.log(`[${req.requestId}] -> ${res.statusCode}`);
  });
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.set("db", db);


// mount route
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fixer", providerRoutes);

module.exports = app;
