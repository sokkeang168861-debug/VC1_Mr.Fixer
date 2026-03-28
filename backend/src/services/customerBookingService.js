const BookingModel = require("../models/customerBookingModel");
const FixerDashboardModel = require("../models/fixerDashboardModel");
const { toImageDataUrl } = require("../utils/imageDataUrl");

function normalizeScheduledAt(value) {
  if (!value) return null;

  const normalized = String(value).trim();
  if (!normalized) return null;

  const withSpace = normalized.replace("T", " ");
  return withSpace.length === 16 ? `${withSpace}:00` : withSpace;
}

function normalizeCoordinate(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw {
      status: 400,
      message: `${fieldName} must be a valid number`,
    };
  }

  return parsedValue;
}

class BookingService {
  static normalizeRating(value, fieldName) {
    if (value === undefined || value === null || value === "" || Number(value) === 0) {
      return null;
    }

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

  static async getFixerProfile(db, user, bookingId) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can access fixer profiles" };
    }

    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw { status: 400, message: "Invalid booking id" };
    }

    const fixer = await BookingModel.getFixerProfileBaseByBookingId(
      db,
      normalizedBookingId,
      customerId
    );

    if (!fixer) {
      throw { status: 404, message: "Fixer profile not found" };
    }

    const [categories, stats, ratingSummary, recentReviews] = await Promise.all([
      BookingModel.getFixerCategoriesByProviderId(db, fixer.provider_id),
      BookingModel.getFixerBookingStatsByProviderId(db, fixer.provider_id),
      FixerDashboardModel.getRatingSummary(db, fixer.provider_id),
      BookingModel.getFixerReviewsByProviderId(db, fixer.provider_id, 6),
    ]);

    const totalBookings = Number(stats?.total_bookings || 0);
    const acceptedBookings = Number(stats?.accepted_bookings || 0);
    const completedJobs = Number(stats?.completed_jobs || 0);
    const acceptanceRate =
      totalBookings > 0
        ? Math.round((acceptedBookings / totalBookings) * 100)
        : 0;

    return {
      booking_id: normalizedBookingId,
      fixer_user_id: Number(fixer.fixer_user_id),
      provider_id: Number(fixer.provider_id),
      full_name: fixer.full_name || "",
      email: fixer.email || "",
      phone: fixer.phone || "",
      profile_img: toImageDataUrl(fixer.profile_img),
      company_name: fixer.company_name || "",
      bio: fixer.bio || "",
      location: fixer.location || "",
      latitude:
        fixer.latitude !== null && fixer.latitude !== undefined
          ? Number(fixer.latitude)
          : null,
      longitude:
        fixer.longitude !== null && fixer.longitude !== undefined
          ? Number(fixer.longitude)
          : null,
      is_verified: Boolean(fixer.is_verified),
      categories,
      stats: {
        experience_years:
          fixer.experience !== null && fixer.experience !== undefined
            ? Number(fixer.experience)
            : 0,
        acceptance_rate: acceptanceRate,
        completed_jobs: completedJobs,
        total_bookings: totalBookings,
      },
      ratings: {
        quality_rating: Number(fixer.quality_rating || 0),
        speed_rating: Number(fixer.speed_rating || 0),
        price_fairness_rating: Number(fixer.price_fairness_rating || 0),
        behavior_rating: Number(fixer.behavior_rating || 0),
        overall_rating: Number(fixer.overall_rating || 0),
        total_ratings: Number(ratingSummary?.total_ratings || 0),
      },
      recent_reviews: recentReviews.map((review) => ({
        id: Number(review.id),
        customer_name: review.customer_name || "Customer",
        overall_rating: Number(review.overall_rating || 0),
        comment: review.comment || "",
        created_at: review.created_at || null,
      })),
    };
  }

  static async getReceiptDetails(db, user, bookingId) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can access receipts" };
    }

    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw { status: 400, message: "Invalid booking id" };
    }

    const receipt = await BookingModel.getReceiptDetailsByBookingId(
      db,
      normalizedBookingId,
      customerId
    );

    if (!receipt) {
      throw { status: 404, message: "Receipt not found" };
    }

    return receipt;
  }

  static async createPendingPayment(db, user, bookingId) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can create payments" };
    }

    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw { status: 400, message: "Invalid booking id" };
    }

    return await BookingModel.createPendingPaymentByBookingId(
      db,
      normalizedBookingId,
      customerId
    );
  }

  static async getLatestPayment(db, user, bookingId) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can access payments" };
    }

    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw { status: 400, message: "Invalid booking id" };
    }

    const payment = await BookingModel.getLatestPaymentByBookingId(
      db,
      normalizedBookingId,
      customerId
    );

    if (!payment) {
      throw { status: 404, message: "Payment not found" };
    }

    return payment;
  }

  static async completeLatestPayment(db, user, bookingId) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can complete payments" };
    }

    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw { status: 400, message: "Invalid booking id" };
    }

    return await BookingModel.completeLatestPaymentByBookingId(
      db,
      normalizedBookingId,
      customerId
    );
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

  static async updateBookingLocation(db, user, bookingId, body) {
    const customerId = user?.id;
    const role = String(user?.role || "").toLowerCase();

    if (!customerId) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (role !== "customer") {
      throw { status: 403, message: "Only customers can update booking location" };
    }

    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw { status: 400, message: "Invalid booking id" };
    }

    const latitude = normalizeCoordinate(body?.latitude, "latitude");
    const longitude = normalizeCoordinate(body?.longitude, "longitude");
    const serviceAddress =
      typeof body?.service_address === "string" && body.service_address.trim()
        ? body.service_address.trim()
        : undefined;

    const result = await BookingModel.updateBookingLocationByCustomer(
      db,
      normalizedBookingId,
      customerId,
      {
        latitude,
        longitude,
        ...(serviceAddress !== undefined
          ? { service_address: serviceAddress }
          : {}),
      }
    );

    if (!result?.affectedRows) {
      throw {
        status: 404,
        message: "Active booking not found",
      };
    }

    return await BookingModel.getBookingDetailsById(
      db,
      normalizedBookingId,
      customerId
    );
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
