const User = require("../models/userModel");

// Helper: convert BLOB → base64 image
const toBase64Image = (buffer) => {
  return buffer && Buffer.isBuffer(buffer)
    ? `data:image/jpeg;base64,${buffer.toString("base64")}`
    : null;
};

const getUsers = async (req, res) => {
  const db = req.app.get("db");
  try {
    const results = await User.getAllUsers(db);
    res.json(results);
  } catch (err) {
    console.error("getUsers:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getCurrentUser = (req, res) => {
  res.json(req.user);
};


module.exports = {
  getUsers,
  getCurrentUser,
};