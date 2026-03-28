const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const {
  getUserStats,
  getTransactionLedger,
} = require("../controllers/adminController");
const {
  getAllUsers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/adminUsersController");
const ServiceCategoryController = require("../controllers/serviceCategoryController");
const FixerManagementController = require("../controllers/fixerManagementController");

// ---------- Admin Stats ----------
router.get("/stats", protect, adminCheck, getUserStats);
router.get("/users", protect, adminCheck, getAllUsers);
router.get("/users/:id", protect, adminCheck, getCustomerById);
router.put("/users/:id", protect, adminCheck, updateCustomer);
router.delete("/users/:id", protect, adminCheck, deleteCustomer);
router.get("/transactions", protect, adminCheck, getTransactionLedger);

// ---------- Fixer Management ----------
router.post(
  "/fixers",
  protect,
  adminCheck,
  upload.fields([
    { name: "profile_img", maxCount: 1 },
    { name: "qr", maxCount: 1 },
  ]),
  FixerManagementController.createFixer
);
router.get(
  "/fixers",
  protect,
  adminCheck,
  FixerManagementController.getFixers
);
router.get(
  "/fixers/:id/detail",
  protect,
  adminCheck,
  FixerManagementController.getFixerDetail
);
router.put(
  "/fixers/:id",
  protect,
  adminCheck,
  upload.fields([
    { name: "profile_img", maxCount: 1 },
    { name: "qr", maxCount: 1 },
  ]),
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
