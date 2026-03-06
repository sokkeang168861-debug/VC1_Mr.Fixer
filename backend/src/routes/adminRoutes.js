const express = require("express");
const router = express.Router();
const { getUsers } = require("../controllers/serviceCategoryController");
const protect = require("../middleware/authMiddleware");

router.get("/category", protect, getUsers); // only logged-in users can access

module.exports = router;