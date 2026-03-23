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

const getCurrentUser = async (req, res) => {
  const db = req.app.get("db");
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(db, userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user,
      profile_img: toBase64Image(user.profile_img),
    });
  } catch (err) {
    console.error("getCurrentUser:", err.message);
    res.status(500).json({ message: "Failed to fetch current user" });
  }
};


module.exports = {
  getUsers,
  getCurrentUser,
};
