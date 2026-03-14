const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const providerRoutes = require("./routes/providerRoutes");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log(`Content-Type: ${req.headers["content-type"]}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`Parsed Body:`, req.body);
  }
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
