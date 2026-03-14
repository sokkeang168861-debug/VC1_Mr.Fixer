const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getHomepageData } = require("../controllers/fixerDashboardController");

const router = express.Router();

router.get("/homepage", protect, getHomepageData);

module.exports = router;
