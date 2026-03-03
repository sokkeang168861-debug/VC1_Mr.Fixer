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
    res.status(201).json({ message: "User created", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

const login = async (req, res) => {
  const db = req.app.get("db");
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(db, email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Logged in", token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

module.exports = { register, login, JWT_SECRET };