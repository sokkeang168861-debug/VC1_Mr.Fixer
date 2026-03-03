const User = require("../models/userModel");

const getUsers = (req, res) => {
  const db = req.app.get("db");

  User.getAllUsers(db, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch users" });
    }

    res.json(results);
  });
};

module.exports = { getUsers };