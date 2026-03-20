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

// ---------- Booking ----------
const getBookingCategories = async (req, res) => {
  const db = req.app.get("db");

  try {
    const results = await User.getBookingCategories(db);

    const formatted = results.map((row) => ({
      ...row,
      image: toBase64Image(row.image),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch booking categories",
      error: err.message,
    });
  }
};

const createBooking = async (req, res) => {
  const db = req.app.get("db");
  const customerId = req.user?.id;

  const {
    service_id,
    issue_description,
    service_address,
    scheduled_at,
  } = req.body;

  // Auth check
  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Validation
  if (!service_id || !issue_description?.trim()) {
    return res.status(400).json({
      message: "service_id and issue_description are required",
    });
  }

  try {
    const result = await User.createBooking(db, {
      customer_id: customerId,
      service_id: Number(service_id),
      service_address: service_address?.trim() || null,
      issue_description: issue_description.trim(),
      status: "pending",
      scheduled_at: scheduled_at || null,
    });

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create booking",
      error: err.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  const db = req.app.get("db");
  const customerId = req.user?.id;

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const bookings = await User.getBookingsByCustomer(db, customerId);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: err.message,
    });
  }
};

module.exports = {
  getUsers,
  getCurrentUser,
  getBookingCategories,
  createBooking,
  getMyBookings,
};
