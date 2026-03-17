const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

// Controllers
const {
  getUsers,
  getCurrentUser,
  getBookingCategories,
  createBooking,
  getMyBookings,
} = require("../controllers/userController");

const ServiceCategoryController = require("../controllers/serviceCategoryController");

// ---------- User routes ----------
router.get("/", protect, getUsers);
router.get("/currentUser", protect, getCurrentUser);

// ---------- Categories ----------
router.get("/allCategories", ServiceCategoryController.getAllCategories);
router.get("/providersEachCategory/:categoryId", ServiceCategoryController.getProvidersByCategory);

// ---------- Booking ----------
router.get("/booking-categories", getBookingCategories);
router.get("/bookings/allCategories", getBookingCategories);
router.post("/bookings", protect, createBooking);
router.get("/bookings", protect, getMyBookings);

module.exports = router;