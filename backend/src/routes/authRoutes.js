const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { register, login, logout, changePassword } = require("../controllers/authController");

const inflightLogins = new Map();

const dedupeLogin = (req, res, next) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const key = `${req.ip}|${email}|${password}`;

  if (inflightLogins.get(key)) {
    return res.status(429).json({ message: "Duplicate login request. Please wait a moment and try again." });
  }

  inflightLogins.set(key, true);
  res.on("finish", () => inflightLogins.delete(key));
  res.on("close", () => inflightLogins.delete(key));

  next();
};

router.post("/register", register);

router.post("/login", dedupeLogin, login);

router.post("/logout", logout);
router.post("/change-password", protect, changePassword);

module.exports = router;
