// services/bookingService.js
const BookingModel = require("../models/bookingModel");

class BookingService {
  static async createBooking(db, user, body) {
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

    // Validation
    if (!service_id || !issue_description?.trim()) {
      throw {
        status: 400,
        message: "service_id and issue_description are required",
      };
    }

    if (!latitude || !longitude) {
      throw {
        status: 400,
        message: "Location (latitude & longitude) is required",
      };
    }

    // Prepare data
    const payload = {
      customer_id: customerId,
      service_id: Number(service_id),
      issue_description: issue_description.trim(),
      service_address: service_address?.trim() || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      urgent_level: urgent_level || "normal",
      status: "pending",
      scheduled_at: scheduled_at || null,
    };

    const result = await BookingModel.createBooking(db, payload);

    return result;
  }
}

module.exports = BookingService;