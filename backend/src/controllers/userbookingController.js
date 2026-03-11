const Booking = require("../models/userbookingModel");

/**
 * Create a new booking based on the customer form
 * POST /api/bookings
 */
const createBooking = async (req, res) => {
  try {
    const db = req.app.get("db");
    const userId = req.user.id; // from auth middleware

    const {
      service_id,
      service_address,
      issue_description,
      urgency,
    } = req.body;

    // required fields validation
    if (
      !service_id ||
      !service_address ||
      !issue_description ||
      !urgency
    ) {
      return res.status(400).json({
        message:
          "Please provide service_id, service_address, issue_description, and urgency",
      });
    }

    const validUrgencies = ["Normal", "Urgent", "Emergency"];
    if (!validUrgencies.includes(urgency)) {
      return res.status(400).json({
        message: "Urgency must be one of: Normal, Urgent, Emergency",
      });
    }

    // optional photo upload handling
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer.toString("base64"),
      }));
    }

    const bookingData = {
      customer_id: userId,
      service_id,
      service_address,
      issue_description,
      urgency,
      photos: photos.length > 0 ? photos : null,
    };

    const result = await Booking.createBooking(db, bookingData);
    res.status(201).json({
      message: "Booking created successfully",
      booking_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

/**
 * Get nearby fixers for a specific booking by service category match
 * GET /api/bookings/:bookingId/nearby-fixers
 */
const getNearbyFixers = (req, res) => {
  try {
    const db = req.app.get("db");
    const { bookingId } = req.params;

    Booking.getNearbyFixersByBooking(db, bookingId)
      .then((fixers) => {
        // format profile images if they exist
        const formattedFixers = fixers.map((fixer) => {
          if (fixer.profile_img && Buffer.isBuffer(fixer.profile_img)) {
            fixer.profile_img = `data:image/jpeg;base64,${fixer.profile_img.toString(
              "base64"
            )}`;
          }
          return fixer;
        });
        res.json(formattedFixers);
      })
      .catch((error) => {
        console.error("Error fetching nearby fixers:", error);
        res.status(500).json({
          message: "Failed to fetch nearby fixers",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getNearbyFixers,
};
