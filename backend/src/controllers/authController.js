const authService = require("../services/authService");

const changePassword = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await authService.changePassword(db, req.user?.id, req.body);
    res.json(result);
  } catch (err) {
    const message = err.message || "Change password failed";

    if (
      message === "Not authenticated" ||
      message === "User not found" ||
      message === "Current password is incorrect" ||
      message === "New password must be different from current password" ||
      message === "Current password and new password are required" ||
      message === "New password must be at least 6 characters"
    ) {
      return res.status(400).json({ message });
    }

    res.status(500).json({
      message: "Change password failed",
      error: message,
    });
  }
};

// ===================================REGISTER====================================
const register = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await authService.register(db, req.body);

    res.status(201).json(result);

  } catch (err) {

    if (err.message === "Email already exists") {
      return res.status(400).json({ message: err.message });
    }

    if (err.message === "Full name, phone, email, and password are required") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
};




// ===================================LOGIN====================================
const login = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await authService.login(db, req.body);

    res.json(result);

  } catch (err) {

    if (
      err.message === "Invalid credentials" ||
      err.message === "Email and password are required"
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};




// ===================================LOGOUT====================================
const logout = async (req, res) => {
  // Since JWT is stateless, the server doesn't "delete" the token.
  // For now, we return success to confirm the intent.
  res.json({ message: "Logged out successfully" });
};


module.exports = { register, login, logout, changePassword };
