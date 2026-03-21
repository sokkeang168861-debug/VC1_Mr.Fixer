const User = require("../models/userModel");
const UserService = require("../services/userService");

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

  try {
    const user = await UserService.getCurrentUser(db, req.user);
    res.json(user);
  } catch (err) {
    console.error("getCurrentUser:", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to fetch current user" });
  }
};

const getCustomerProfile = async (req, res) => {
  const db = req.app.get("db");

  try {
    const profile = await UserService.getCustomerProfile(db, req.user);
    res.json(profile);
  } catch (err) {
    console.error("getCustomerProfile:", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to fetch customer profile" });
  }
};

const getCustomerLocation = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await UserService.getCustomerLocation(db, req.user);
    res.json(result);
  } catch (err) {
    console.error("getCustomerLocation:", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to fetch customer location" });
  }
};

const updateCustomerProfile = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await UserService.updateCustomerProfile(
      db,
      req.user,
      req.body,
      req.file
    );
    res.json(result);
  } catch (err) {
    console.error("updateCustomerProfile:", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to update customer profile" });
  }
};

const updateCustomerLocation = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await UserService.updateCustomerLocation(db, req.user, req.body);
    res.json(result);
  } catch (err) {
    console.error("updateCustomerLocation:", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to update customer location" });
  }
};

module.exports = {
  getUsers,
  getCurrentUser,
  getCustomerProfile,
  getCustomerLocation,
  updateCustomerProfile,
  updateCustomerLocation,
};
