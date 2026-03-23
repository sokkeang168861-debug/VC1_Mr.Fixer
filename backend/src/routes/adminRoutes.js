const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const { getUserStats } = require("../controllers/adminController");
const ServiceCategoryController = require("../controllers/serviceCategoryController");
const FixerManagementController = require("../controllers/fixerManagementController");

// ---------- Admin Stats ----------
router.get("/stats", protect, adminCheck, getUserStats);

// ---------- Fixer Management ----------
router.get(
  "/fixers",
  protect,
  adminCheck,
  FixerManagementController.getFixers
);
router.put(
  "/fixers/:id",
  protect,
  adminCheck,
  FixerManagementController.updateFixer
);
router.delete(
  "/fixers/:id",
  protect,
  adminCheck,
  FixerManagementController.deleteFixer
);

// ---------- Service Category  ----------
router.post(
  "/createCategory",
  protect,
  adminCheck,
  upload.single("image"),
  ServiceCategoryController.createCategory
);

router.get(
  "/getAllCategories",
  protect,
  adminCheck,
  ServiceCategoryController.getAllCategories
);

router.get(
  "/findCategory",
  protect,
  adminCheck,
  ServiceCategoryController.findCategory
);

router.put(
  "/updateCategory/:id",
  protect,
  adminCheck,
  upload.single("image"),
  ServiceCategoryController.updateCategory
);

router.delete(
  "/deleteCategory/:id",
  protect,
  adminCheck,
  ServiceCategoryController.deleteCategory
);

module.exports = router;
