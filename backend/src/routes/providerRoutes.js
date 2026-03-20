const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getHomepageData } = require("../controllers/fixerDashboardController");
const upload = require("../middleware/upload");
const {
  getFixerProfile,
  updateFixerProfile,
  updateFixerLocation,
  updateFixerNotifications,
} = require("../controllers/fixerProfileController");
const ProviderRequestController = require("../controllers/bookingController");

const router = express.Router();

router.get("/homepage", protect, getHomepageData);
router.get("/settings/profile", protect, getFixerProfile);
router.put(
  "/settings/profile",
  protect,
  upload.single("profile_img"),
  updateFixerProfile
);
router.put("/settings/location", protect, updateFixerLocation);
router.put("/settings/notifications", protect, updateFixerNotifications);
// bookings
router.get(
  "/provider/requests",
  protect,
  ProviderRequestController.getAllRequests
);
router.get(
  "/provider/requests/:id",
  protect,
  ProviderRequestController.getRequestById
);
router.post(
  "/provider/requests/:id/accept",
  protect,
  ProviderRequestController.acceptAndSetProposal
);
module.exports = router;
