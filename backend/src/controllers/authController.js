const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = "your_secret_key"; // change this in production!!!

const register = async (req, res) => {
  const db = req.app.get("db");
  const { full_name, phone, email, password } = req.body;

  try {
    const existing = await User.findByEmail(db, email);
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const result = await User.createUser(db, { full_name, phone, email, password });

    // sign a JWT for the newly created user (include full name so the frontend can show it immediately)
    const payload = { id: result.insertId, email, role: "customer", full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "User created",
      token,
      role: "customer",
      full_name,
      userId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};


const login = async (req, res) => {
  const db = req.app.get("db");
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  try {
    const user = await User.findByEmail(db, email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Logged in",
      token,
      role: user.role,
      full_name: user.full_name
    });

  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};

module.exports = { register, login, JWT_SECRET };
