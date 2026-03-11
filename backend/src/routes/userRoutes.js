const express = require("express");
const router = express.Router();
const { getUsers, getCurrentUser, getAllCategories, providersEachCategory } = require("../controllers/userController");
const { createBooking } = require("../controllers/userbookingController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// User routes
router.get("/", protect, getUsers); // only logged-in users can access
router.get("/currentUser", protect, getCurrentUser); // only logged-in users can access
router.get("/allCategories", getAllCategories);
router.get("/providersEachCategory/:categoryId", providersEachCategory);

// Booking routes
router.post("/bookings", protect, upload.any("photos"), createBooking); // create a booking from the customer form

module.exports = router;