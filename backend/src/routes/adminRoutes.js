const express = require("express");
const { getUserStats } = require("../controllers/adminController");

const router = express.Router();

router.get("/stats", getUserStats);

module.exports = router;
