const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const ServiceCategoryController = require("../controllers/serviceCategoryController");
const protect = require("../middleware/authMiddleware");

// router.post("/createCategory", protect, ServiceCategoryController.createCategory);
// router.post("/categories",upload.single("image"),ServiceCategoryController.createCategory);
router.post("/createCategory", protect, upload.single("images"), ServiceCategoryController.createCategory);
router.put("/updateCategory/:id", protect, ServiceCategoryController.updateCategory);


module.exports = router;