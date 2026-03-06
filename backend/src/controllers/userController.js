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

const getAllCategories = (req, res) => {
  const db = req.app.get("db");

  User.getAllCategories(db, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch service categories" });
    }

    const formatted = results.map((row) => {
      if (row.image && Buffer.isBuffer(row.image)) {
        // Convert binary image blob into a base64 string so it can be embedded in an <img />
        // If you store the mime type separately, you can replace 'image/jpeg' accordingly.
        row.image = `data:image/jpeg;base64,${row.image.toString("base64")}`;
      }
      return row;
    });

    res.json(formatted);
  });
};

module.exports = { getUsers, getCurrentUser, getAllCategories };