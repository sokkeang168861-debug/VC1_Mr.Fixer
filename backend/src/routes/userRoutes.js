const express = require("express");
const router = express.Router();
const { getUsers, getCurrentUser, getAllCategories, providersEachCategory } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getUsers); // only logged-in users can access
router.get("/currentUser", protect, getCurrentUser); // only logged-in users can access
router.get("/allCategories", getAllCategories);
router.get("/providersEachCategory/:categoryId", providersEachCategory);

module.exports = router;