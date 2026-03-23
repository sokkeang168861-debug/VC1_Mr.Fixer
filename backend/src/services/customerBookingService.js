const BookingModel = require("../models/customerBookingModel");
const bookingTimeoutService = require("./bookingTimeoutService");

function normalizeScheduledAt(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const withSpace = normalized.replace("T", " ");
  return withSpace.length === 16 ? `${withSpace}:00` : withSpace;
}

class BookingService {
  static async createBooking(db, user, body, files = []) {
    const customerId = user?.id;

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
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

    const parsedServiceId = Number(service_id);
    if (Number.isNaN(parsedServiceId) || parsedServiceId <= 0) {
      throw {
        status: 400,
        message: "service_id must be a valid numeric service ID",
      };
    }

    if (latitude === undefined || latitude === null || latitude === "" || longitude === undefined || longitude === null || longitude === "") {
      throw {
        status: 400,
        message: "Location (latitude & longitude) is required",
      };
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
      throw {
        status: 400,
        message: "Location coordinates must be valid numbers",
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
      service_id: parsedServiceId,
      issue_description: issue_description.trim(),
      service_address: service_address?.trim() || null,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      urgent_level: String(urgent_level || "low"),
      status: "pending",
      scheduled_at: normalizeScheduledAt(scheduled_at),
    };

    const result = await BookingModel.createBooking(db, payload, files);

    // Start the 3-minute timeout for this booking
    bookingTimeoutService.startTimeout(result.insertId, customerId);

    return result;
  }
}

module.exports = BookingService;
