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

/**
 * Get complete booking agreement details with all service, provider, and pricing info
 * GET /api/bookings/:bookingId/agreement
 */
const getBookingAgreement = (req, res) => {
  try {
    const db = req.app.get("db");
    const { bookingId } = req.params;
    const userId = req.user.id;

    Booking.getBookingAgreementDetails(db, bookingId)
      .then((booking) => {
        // verify user owns this booking
        if (booking.customer_id !== userId) {
          return res.status(403).json({
            message: "You do not have permission to view this booking",
          });
        }

        // format images
        if (booking.profile_img && Buffer.isBuffer(booking.profile_img)) {
          booking.profile_img = `data:image/jpeg;base64,${booking.profile_img.toString(
            "base64"
          )}`;
        }
        if (booking.category_image && Buffer.isBuffer(booking.category_image)) {
          booking.category_image = `data:image/jpeg;base64,${booking.category_image.toString(
            "base64"
          )}`;
        }

        res.json(booking);
      })
      .catch((error) => {
        console.error("Error fetching booking agreement:", error);
        if (error.message === "Booking not found") {
          return res.status(404).json({
            message: "Booking not found",
          });
        }
        res.status(500).json({
          message: "Failed to fetch booking agreement",
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

/**
 * Confirm booking with pricing details and scheduled time
 * PUT /api/bookings/:bookingId/confirm
 */
const confirmBooking = (req, res) => {
  try {
    const db = req.app.get("db");
    const { bookingId } = req.params;
    const userId = req.user.id;

    const {
      service_fee,
      proposed_price,
      scheduled_at,
      proposal_notes,
      final_price,
    } = req.body;

    // validate required fields
    if (!proposed_price || !scheduled_at) {
      return res.status(400).json({
        message: "Please provide proposed_price and scheduled_at",
      });
    }

    // verify booking exists and belongs to user
    Booking.getBookingAgreementDetails(db, bookingId)
      .then((booking) => {
        if (booking.customer_id !== userId) {
          return res.status(403).json({
            message: "You do not have permission to confirm this booking",
          });
        }

        const updateData = {
          service_fee,
          proposed_price,
          scheduled_at,
          proposal_notes,
          final_price,
        };

        Booking.updateBookingPricing(db, bookingId, updateData)
          .then(() => {
            res.json({
              message: "Booking confirmed successfully",
              booking_id: bookingId,
              status: "confirmed",
            });
          })
          .catch((error) => {
            console.error("Error confirming booking:", error);
            res.status(500).json({
              message: "Failed to confirm booking",
              error: error.message,
            });
          });
      })
      .catch((error) => {
        console.error("Error verifying booking:", error);
        if (error.message === "Booking not found") {
          return res.status(404).json({
            message: "Booking not found",
          });
        }
        res.status(500).json({
          message: "Failed to verify booking",
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
  getBookingAgreement,
  confirmBooking,
};
