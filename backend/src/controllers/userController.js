const User = require("../models/userModel");

// Helper: convert BLOB → base64 image
const toBase64Image = (buffer) => {
  return buffer && Buffer.isBuffer(buffer)
    ? `data:image/jpeg;base64,${buffer.toString("base64")}`
    : null;
};

// ---------- Users ----------
const getUsers = (req, res) => {
  const db = req.app.get("db");

  User.getAllUsers(db, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch users" });
    }

    res.json(results);
  });
};

const getCurrentUser = (req, res) => {
  // Provided by authMiddleware (JWT)
  res.json(req.user);
};

// ---------- Categories ----------
const getAllCategories = (req, res) => {
  const db = req.app.get("db");

  User.getAllCategories(db, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch service categories",
      });
    }

    const formatted = results.map((row) => ({
      ...row,
      image: toBase64Image(row.image),
    }));

    res.json(formatted);
  });
};

const providersEachCategory = (req, res) => {
  const db = req.app.get("db");
  const { categoryId } = req.params;

  User.providersEachCategory(db, categoryId, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch providers",
        error: err.message,
      });
    }

    const formatted = results.map((row) => ({
      ...row,
      profile_img: toBase64Image(row.profile_img),
    }));

    res.json(formatted);
  });
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

// SINGLE export (fixed)
module.exports = {
  getUsers,
  getCurrentUser,
  getAllCategories,
  providersEachCategory,
  getBookingCategories,
  createBooking,
  getMyBookings,
};