const BookingModel = require("../models/customerBookingModel");

function normalizeScheduledAt(value) {
  if (!value) return null;

  const normalized = String(value).trim();
  if (!normalized) return null;

  const withSpace = normalized.replace("T", " ");
  return withSpace.length === 16 ? `${withSpace}:00` : withSpace;
}

class BookingService {
  static normalizeRating(value, fieldName) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 5) {
      throw {
        status: 400,
        message: `${fieldName} must be an integer between 1 and 5`,
      };
    }

    return parsedValue;
  }

  static async createBooking(db, user, body, files = []) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can create bookings" };
    }

    const {
      service_id,
      issue_description,
      service_address,
      latitude,
      longitude,
      scheduled_at,
      urgent_level,
    } = body;

    if (!service_id || !issue_description?.trim()) {
      throw {
        status: 400,
        message: "service_id and issue_description are required",
      };
    }

    if (
      latitude === undefined ||
      latitude === null ||
      latitude === "" ||
      longitude === undefined ||
      longitude === null ||
      longitude === ""
    ) {
      throw {
        status: 400,
        message: "Location (latitude & longitude) is required",
      };
    }

    if (!["low", "medium", "high"].includes(String(urgent_level || "low"))) {
      throw {
        status: 400,
        message: "urgent_level must be low, medium, or high",
      };
    }

    const payload = {
      customer_id: customerId,
      service_id: Number(service_id),
      issue_description: issue_description.trim(),
      service_address: service_address?.trim() || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      urgent_level: String(urgent_level || "low"),
      status: "pending",
      scheduled_at: normalizeScheduledAt(scheduled_at),
    };

    return await BookingModel.createBooking(db, payload, files);
  }

  static async getCompletedHistory(db, user) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can access history" };
    }

    return await BookingModel.getCompletedHistory(db, customerId);
  }

  static async getLatestActiveBooking(db, user) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can access bookings" };
    }

    return await BookingModel.getLatestActiveBookingByCustomerId(
      db,
      customerId
    );
  }

  static async confirmBooking(db, user, bookingId) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can confirm bookings" };
    }

    const result = await BookingModel.confirmBookingByCustomer(
      db,
      Number(bookingId),
      customerId
    );

    if (!result?.affectedRows) {
      throw {
        status: 404,
        message: "Booking not found or not ready for confirmation",
      };
    }

    return await BookingModel.getBookingDetailsById(
      db,
      Number(bookingId),
      customerId
    );
  }

  static async rejectBooking(db, user, bookingId) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can reject bookings" };
    }

    const result = await BookingModel.rejectBookingByCustomer(
      db,
      Number(bookingId),
      customerId
    );

    if (!result?.affectedRows) {
      throw {
        status: 404,
        message: "Booking not found or not ready for rejection",
      };
    }

    return { id: Number(bookingId), status: "customer_reject" };
  }

  static async submitReview(db, user, bookingId, body) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can submit reviews" };
    }

    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw { status: 400, message: "Invalid booking id" };
    }

    const comment =
      typeof body?.comment === "string" ? body.comment.trim() : "";

    return await BookingModel.createReview(db, {
      booking_id: normalizedBookingId,
      customer_id: customerId,
      quality_rating: this.normalizeRating(
        body?.quality_rating ?? body?.quality,
        "quality_rating"
      ),
      speed_rating: this.normalizeRating(
        body?.speed_rating ?? body?.speed,
        "speed_rating"
      ),
      price_fairness_rating: this.normalizeRating(
        body?.price_fairness_rating ?? body?.price_fairness_ratung ?? body?.price,
        "price_fairness_rating"
      ),
      behavior_rating: this.normalizeRating(
        body?.behavior_rating ?? body?.behavior,
        "behavior_rating"
      ),
      overall_rating: this.normalizeRating(
        body?.overall_rating ?? body?.overall,
        "overall_rating"
      ),
      comment: comment || null,
    });
  }
}

module.exports = BookingService;
