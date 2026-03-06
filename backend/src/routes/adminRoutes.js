const express = require("express");
const router = express.Router();

const ServiceCategoryController = require("../controllers/serviceCategoryController");
const protect = require("../middleware/authMiddleware");

router.post("/createCategory", protect, ServiceCategoryController.createCategory);


module.exports = router;