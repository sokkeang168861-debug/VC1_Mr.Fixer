const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const { getUsers, getCurrentUser } = require("../controllers/userController");
const ServiceCategoryController = require("../controllers/serviceCategoryController");
const CustomerBookingController = require("../controllers/customerBookingController");

router.get("/", protect, getUsers);
router.get("/currentUser", protect, getCurrentUser);

router.get("/allCategories", ServiceCategoryController.getAvailableCategories);
router.get("/providersEachCategory/:categoryId", ServiceCategoryController.getProvidersByCategory);
router.get(
  "/bookings/history",
  protect,
  (req, res) => CustomerBookingController.getCompletedHistory(req, res)
);

router.post(
  "/bookings",
  protect,
  upload.array("images", 3),
  (req, res) => CustomerBookingController.createBooking(req, res)
);

module.exports = router;
