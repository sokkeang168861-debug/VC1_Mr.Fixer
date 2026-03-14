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

const currentUser = (req, res) => {
  const db = req.app.get("db");

  User.findByEmail(db, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch users" });
    }

    res.json(results);
  });
};

const getCurrentUser = (req, res) => {
  // req.user is set by authMiddleware (decoded JWT payload)
  res.json(req.user);
};

module.exports = { getUsers, getCurrentUser };