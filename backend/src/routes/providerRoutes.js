const express = require("express");
const protect = require("../middleware/authMiddleware");
const FixerDashboardController = require("../controllers/fixerDashboardController");
const FixerProfitController = require("../controllers/fixerProfitController");
const upload = require("../middleware/upload");
const {
  getFixerProfile,
  updateFixerProfile,
  updateFixerLocation,
  updateFixerNotifications,
} = require("../controllers/fixerProfileController");
const FixerBookingController = require("../controllers/FixerBookingController");

const router = express.Router();

router.get("/homepage", protect, (req, res) =>
  FixerDashboardController.getHomepageData(req, res)
);
router.get("/summary-cards", protect, (req, res) =>
  FixerDashboardController.getSummaryCards(req, res)
);
router.get("/profit", protect, (req, res) =>
  FixerProfitController.getProfitData(req, res)
);
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
  FixerBookingController.getAllRequests
);
router.get(
  "/provider/requests/:id",
  protect,
  FixerBookingController.getRequestById
);
router.post(
  "/provider/requests/:id/accept",
  protect,
  FixerBookingController.acceptAndSetProposal
);
router.post(
  "/provider/requests/:id/reject",
  protect,
  FixerBookingController.rejectBooking
);
router.post(
  "/provider/requests/:id/arrived",
  protect,
  FixerBookingController.markArrived
);
router.post(
  "/provider/requests/:id/complete",
  protect,
  FixerBookingController.completeBooking
);
module.exports = router;
