const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const {
  getUsers,
  getCurrentUser,
  getAllCategories,
  providersEachCategory,
  getBookingCategories,
  createBooking,
  getMyBookings,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getUsers); // only logged-in users can access
router.get("/currentUser", protect, getCurrentUser); // only logged-in users can access
router.get("/allCategories", getAllCategories);
router.get("/providersEachCategory/:categoryId", providersEachCategory);
router.get("/booking-categories", getBookingCategories);
router.get("/bookings/allCategories", getBookingCategories);
router.post("/bookings", protect, createBooking);
router.get("/bookings", protect, getMyBookings);

=======
const protect = require("../middleware/authMiddleware");

const {
  getUsers,
  getCurrentUser,
} = require("../controllers/userController");

const ServiceCategoryController = require("../controllers/serviceCategoryController");

// ---------- User routes ----------
router.get("/", protect, getUsers); // all logged-in users
router.get("/currentUser", protect, getCurrentUser); // logged-in user info

// ---------- Categories for users ----------
router.get("/allCategories", protect, ServiceCategoryController.getAllCategories);
router.get("/providersEachCategory/:categoryId", protect, ServiceCategoryController.getProvidersByCategory);

>>>>>>> 22c83295919d87676d80270642609641e2cb27f1
module.exports = router;
