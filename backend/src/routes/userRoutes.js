const express = require("express");
const router = express.Router();
const { getUsers, getCurrentUser, getAllCategories, providersEachCategory } = require("../controllers/userController");
const { createBooking, getNearbyFixers, getBookingAgreement, confirmBooking } = require("../controllers/userbookingController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// User routes
router.get("/", protect, getUsers); // only logged-in users can access
router.get("/currentUser", protect, getCurrentUser); // only logged-in users can access
router.get("/allCategories", getAllCategories);
router.get("/providersEachCategory/:categoryId", providersEachCategory);

// Booking routes
router.post("/bookings", protect, upload.any("photos"), createBooking); // create a booking from the customer form
router.get("/bookings/:bookingId/nearby-fixers", protect, getNearbyFixers); // get nearby fixers for a booking
router.get("/bookings/:bookingId/agreement", protect, getBookingAgreement); // get booking agreement details
router.put("/bookings/:bookingId/confirm", protect, upload.single("image"), confirmBooking); // confirm booking with pricing and schedule

module.exports = router;