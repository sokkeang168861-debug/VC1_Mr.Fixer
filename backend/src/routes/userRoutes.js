const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getUsers,
  getCurrentUser,
} = require("../controllers/userController");

const ServiceCategoryController = require("../controllers/serviceCategoryController");

// ---------- User routes ----------
router.get("/", protect, getUsers); // all logged-in users
router.get("/currentUser", protect, getCurrentUser); // logged-in user info

// ---------- Categories for users ----------
router.get("/allCategories", protect, ServiceCategoryController.getAllCategories);
router.get("/providersEachCategory/:categoryId", protect, ServiceCategoryController.getProvidersByCategory);

module.exports = router;
