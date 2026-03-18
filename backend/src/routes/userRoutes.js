const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

// Controllers
const {
  getUsers,
  getCurrentUser,
} = require("../controllers/userController");

const CustomerBookingController = require("../controllers/customerBookingController");
const ServiceCategoryController = require("../controllers/serviceCategoryController");

// ---------- User routes ----------
router.get("/", protect, getUsers);
router.get("/currentUser", protect, getCurrentUser);

// ---------- Categories ----------
router.get("/allCategories", ServiceCategoryController.getAllCategories);
router.get("/providersEachCategory/:categoryId", ServiceCategoryController.getProvidersByCategory);

// ---------- Booking ----------
router.get("/booking-categories", CustomerBookingController.getBookingCategories);
router.get("/bookings/allCategories", CustomerBookingController.getBookingCategories);
router.post("/bookings", protect, (req, res) => CustomerBookingController.createBooking(req, res));
router.get("/bookings", protect, (req, res) => CustomerBookingController.getMyBookings(req, res));

module.exports = router;