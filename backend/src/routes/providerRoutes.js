const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getHomepageData } = require("../controllers/fixerDashboardController");
const ProviderRequestController = require("../controllers/bookingController");

const router = express.Router();

router.get("/homepage", protect, getHomepageData);
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