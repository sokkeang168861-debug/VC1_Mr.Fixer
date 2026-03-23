const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  getUsers,
  getCurrentUser,
  getCustomerProfile,
  getCustomerLocation,
  updateCustomerProfile,
  updateCustomerLocation,
} = require("../controllers/userController");
const ServiceCategoryController = require("../controllers/serviceCategoryController");
const CustomerBookingController = require("../controllers/customerBookingController");

router.get("/", protect, getUsers);
router.get("/currentUser", protect, getCurrentUser);
router.get("/profile", protect, getCustomerProfile);
router.get("/location", protect, getCustomerLocation);
router.put("/profile", protect, upload.single("profile_img"), updateCustomerProfile);
router.put("/location", protect, updateCustomerLocation);

router.get("/allCategories", ServiceCategoryController.getAvailableCategories);
router.get("/providersEachCategory/:categoryId", ServiceCategoryController.getProvidersByCategory);

router.post(
  "/bookings",
  protect,
  upload.array("images", 3),
  (req, res) => CustomerBookingController.createBooking(req, res)
);
router.get(
  "/bookings/latest-active",
  protect,
  (req, res) => CustomerBookingController.getLatestActiveBooking(req, res)
);
router.post(
  "/bookings/:id/confirm",
  protect,
  (req, res) => CustomerBookingController.confirmBooking(req, res)
);
router.post(
  "/bookings/:id/reject",
  protect,
  (req, res) => CustomerBookingController.rejectBooking(req, res)
);

module.exports = router;
