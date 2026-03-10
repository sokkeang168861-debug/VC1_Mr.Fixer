const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_not_safe"; // change this in .env!!!

const register = async (req, res) => {
  const db = req.app.get("db");
  const { full_name, phone, email, password } = req.body;

  // Validate required fields
  if (
    !full_name || full_name.trim() === "" ||
    !phone || phone.trim() === "" ||
    !email || email.trim() === "" ||
    !password || password.trim() === ""
  ) {
    return res.status(400).json({
      message: "Full name, phone, email, and password are required"
    });
  }

  try {
    // Check if email already exists
    const existing = await User.findByEmail(db, email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
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

    res.status(201).json({
      message: "User created",
      token,
      role: "customer",
      full_name,
      userId: result.insertId
    });

  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
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

const logout = async (req, res) => {
  // Since JWT is stateless, the server doesn't "delete" the token.
  // This route is a placeholder for any server-side logout logic 
  // like blacklisting tokens (e.g. in Redis or a DB table).
  // For now, we return success to confirm the intent.
  res.json({ message: "Logged out successfully" });
};

module.exports = { register, login, logout, JWT_SECRET };
