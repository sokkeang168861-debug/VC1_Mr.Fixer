const BookingModel = require("../models/customerBookingModel");

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

    if (latitude === undefined || latitude === null || latitude === "" || longitude === undefined || longitude === null || longitude === "") {
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

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    return await BookingModel.getCompletedHistory(db, customerId);
  }
}

module.exports = BookingService;
