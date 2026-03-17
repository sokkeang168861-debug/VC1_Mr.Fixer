const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { register, login, logout, changePassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/change-password", protect, changePassword);

module.exports = router;
