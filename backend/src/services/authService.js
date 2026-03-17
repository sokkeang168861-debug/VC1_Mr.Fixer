const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// Import JWT_SECRET from centralized constants
const { JWT_SECRET } = require("../config/constants");

// ===================================REGISTER====================================
const register = async (db, data) => {
  const { full_name, phone, email, password } = data;

  // Validate fields
  if (
    !full_name || full_name.trim() === "" ||
    !phone || phone.trim() === "" ||
    !email || email.trim() === "" ||
    !password || password.trim() === ""
  ) {
    throw new Error("Full name, phone, email, and password are required");
  }

  // Check existing email
  const existing = await User.findByEmail(db, email);
  if (existing) {
    throw new Error("Email already exists");
  }

  // Create user
  const result = await User.createUser(db, {
    full_name,
    phone,
    email,
    password
  });

  const payload = {
    id: result.insertId,
    email,
    role: "customer",
    full_name
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  return {
    message: "User created",
    token,
    role: "customer",
    full_name,
    userId: result.insertId
  };
};




// ===================================LOGIN====================================
const login = async (db, data) => {
  const { email, password } = data;

  // Validate fields
  if (!email || !password || email.trim() === "" || password.trim() === "") {
    throw new Error("Email and password are required");
  }

  // Find user
  const user = await User.findByEmail(db, email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Invalid credentials");
  }

  // Create token payload
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  return {
    message: "Logged in",
    token,
    role: user.role,
    full_name: user.full_name
  };
};


// ===============================CHANGE PASSWORD================================
const changePassword = async (db, userEmail, data) => {
  const { currentPassword, newPassword } = data || {};

  if (!userEmail) {
    throw new Error("Not authenticated");
  }

  if (
    !currentPassword || String(currentPassword).trim() === "" ||
    !newPassword || String(newPassword).trim() === ""
  ) {
    throw new Error("Current password and new password are required");
  }

  if (String(newPassword).trim().length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findByEmail(db, userEmail);
  if (!user) {
    throw new Error("User not found");
  }

  const match = await bcrypt.compare(String(currentPassword), user.password);
  if (!match) {
    throw new Error("Current password is incorrect");
  }

  const hashed = await bcrypt.hash(String(newPassword), 10);
  await User.updatePasswordById(db, user.id, hashed);

  return { message: "Password updated" };
};

module.exports = { register, login, changePassword };
