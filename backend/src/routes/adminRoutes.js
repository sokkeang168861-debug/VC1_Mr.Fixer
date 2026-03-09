const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const ServiceCategoryController = require("../controllers/serviceCategoryController");
const protect = require("../middleware/authMiddleware");
const { getUserStats } = require("../controllers/adminController");

// router.post("/createCategory", protect, ServiceCategoryController.createCategory);
router.post("/createCategory", protect, upload.single("image"), ServiceCategoryController.createCategory);
router.get("/getAllCategories", protect, ServiceCategoryController.getAllCategories);
router.get("/findCategory", protect, ServiceCategoryController.findCategory);
// router.put("/updateCategory/:id", protect, ServiceCategoryController.updateCategory);
router.put("/updateCategory/:id", protect, upload.single("image"), ServiceCategoryController.updateCategory);
router.delete("/deleteCategory/:id", protect, ServiceCategoryController.deleteCategory);

router.get("/stats", protect, getUserStats);

module.exports = router;
