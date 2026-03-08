const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.set("db", db);

app.get("/api", (req, res) => {
  res.json({ fruits: ["apple", "orange"] });
});






// mount route
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);

module.exports = app;
