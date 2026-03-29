const FixerManagementModel = require("../models/fixerManagementModel");
const bcrypt = require("bcrypt");

class FixerManagementService {
  static COMMISSION_RATE = 0.1;
  static DEFAULT_FIXER_PASSWORD = "secret123";

  static toOptionalString(value) {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  }

  static buildTemporaryPassword() {
    const token = Math.random().toString(36).slice(-6);
    return `Fixer@${token}1`;
  }

  static isLikelyConnectionResetError(error) {
    const code = this.toOptionalString(error?.code) || "";
    const message = this.toOptionalString(error?.message) || "";
    const upperCode = code.toUpperCase();
    const upperMessage = message.toUpperCase();

    return (
      upperCode === "ECONNRESET" ||
      upperCode === "EPIPE" ||
      upperCode === "PROTOCOL_CONNECTION_LOST" ||
      upperCode === "ER_NET_PACKET_TOO_LARGE" ||
      upperMessage.includes("ECONNRESET") ||
      upperMessage.includes("PACKET TOO LARGE")
    );
  }

  static parseCoordinateValue(value, name) {
    const normalized = this.toOptionalString(value);
    if (normalized === null) return null;

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${name} must be a valid number`);
    }

    return Number(parsed.toFixed(8));
  }

  static validateCoordinateRange(latitude, longitude) {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
  }

  static async resolveCoordinates(payload = {}, fallbackLocation = null) {
    const parsedLatitude = this.parseCoordinateValue(payload.latitude, "Latitude");
    const parsedLongitude = this.parseCoordinateValue(
      payload.longitude,
      "Longitude"
    );

    const hasLatitude = parsedLatitude !== null;
    const hasLongitude = parsedLongitude !== null;

    if (hasLatitude !== hasLongitude) {
      throw new Error("Latitude and longitude must be provided together");
    }

    if (hasLatitude && hasLongitude) {
      this.validateCoordinateRange(parsedLatitude, parsedLongitude);
      return { latitude: parsedLatitude, longitude: parsedLongitude };
    }

    return await this.geocodeLocation(fallbackLocation);
  }

  static extractCoordinatesFromText(locationText) {
    const source = this.toOptionalString(locationText);
    if (!source) return null;

    const patterns = [
      /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
      /[?&](?:q|query|ll|sll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
      /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
    ];

    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (!match) continue;

      const latitude = Number(match[1]);
      const longitude = Number(match[2]);

      if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        return {
          latitude: Number(latitude.toFixed(8)),
          longitude: Number(longitude.toFixed(8)),
        };
      }
    }

    return null;
  }

  static async geocodeLocation(location) {
    const normalizedLocation = this.toOptionalString(location);

    if (!normalizedLocation) {
      return { latitude: null, longitude: null };
    }

    const extracted = this.extractCoordinatesFromText(normalizedLocation);
    if (extracted) {
      return extracted;
    }

    if (typeof globalThis.fetch !== "function") {
      return { latitude: null, longitude: null };
    }

    const controller = new globalThis.AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 10000);

    try {
      const params = new globalThis.URLSearchParams({
        format: "jsonv2",
        q: normalizedLocation,
        limit: "1",
      });

      const response = await globalThis.fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "MrFixer-Admin/1.0 (fixer-management-geocoding)",
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        return { latitude: null, longitude: null };
      }

      const results = await response.json();
      const bestMatch = Array.isArray(results) ? results[0] : null;

      const latitude = Number(bestMatch?.lat);
      const longitude = Number(bestMatch?.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return { latitude: null, longitude: null };
      }

      return {
        latitude: Number(latitude.toFixed(8)),
        longitude: Number(longitude.toFixed(8)),
      };
    } catch (_error) {
      return { latitude: null, longitude: null };
    } finally {
      globalThis.clearTimeout(timeout);
    }
  }

  static parseCategoryIds(rawCategoryIds) {
    if (Array.isArray(rawCategoryIds)) {
      return [
        ...new Set(rawCategoryIds.map((id) => Number(id)).filter(Boolean)),
      ];
    }

    if (
      rawCategoryIds === undefined ||
      rawCategoryIds === null ||
      rawCategoryIds === ""
    ) {
      return [];
    }

    if (typeof rawCategoryIds === "string") {
      const trimmed = rawCategoryIds.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return [...new Set(parsed.map((id) => Number(id)).filter(Boolean))];
        }
      } catch (_error) {
        // Fallback to comma-separated parsing when the payload is plain string(s).
      }

      return [
        ...new Set(
          trimmed
            .split(",")
            .map((id) => Number(String(id).trim()))
            .filter(Boolean)
        ),
      ];
    }

    return [];
  }

  static async listFixers(db) {
    const records = await FixerManagementModel.getFixersWithStats(db);

    return records.map((item) => this.formatFixerRecord(item));
  }

  static roundMoney(value) {
    return Number((Number(value || 0) + Number.EPSILON).toFixed(2));
  }

  static formatFixerRecord(item) {
    const categoriesArray = item.categories
      ? item.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const fixerId = item.providerId
      ? `FX-${String(item.providerId).padStart(4, "0")}`
      : `FX-${String(item.userId || "0000").padStart(4, "0")}`;

    return {
      userId: item.userId,
      providerId: item.providerId,
      fixerId,
      name: item.fullName,
      email: item.email,
      phone: item.phone,
      companyName: item.companyName,
      location: item.location,
      latitude: item.latitude,
      longitude: item.longitude,
      experience: item.experience,
      bio: item.bio,
      categories: categoriesArray,
      categoryIds: Array.isArray(item.categoryIds) ? item.categoryIds : [],
      totalBookings: item.totalBookings,
      rating: item.overallRating,
      avatar: item.avatar,
      qr: item.qr,
    };
  }

  static buildReviewInitials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  static async getFixerDetail(db, providerId) {
    if (!providerId || !Number.isInteger(Number(providerId))) {
      throw new Error("providerId is required");
    }

    const numericProviderId = Number(providerId);

    const [record, reviewSummary, reviews, transactions] = await Promise.all([
      FixerManagementModel.getFixerDetailByProviderId(db, numericProviderId),
      FixerManagementModel.getFixerReviewSummary(db, numericProviderId),
      FixerManagementModel.getFixerReviews(db, numericProviderId),
      FixerManagementModel.getFixerTransactions(db, numericProviderId),
    ]);

    if (!record) {
      return { found: false };
    }

    const profile = this.formatFixerRecord(record);
    const totalReviews = Number(reviewSummary.total_reviews || 0);
    const overallRatingValue =
      totalReviews > 0
        ? Number(reviewSummary.overall_rating || 0)
        : Number(profile.rating || 0);
    const detailedRatings = [
      {
        key: "quality_of_work",
        label: "Quality of Work",
        value: Number(reviewSummary.quality_rating || 0),
      },
      {
        key: "speed_of_service",
        label: "Speed of Service",
        value: Number(reviewSummary.speed_rating || 0),
      },
      {
        key: "price_fairness",
        label: "Price Fairness",
        value: Number(reviewSummary.price_fairness_rating || 0),
      },
      {
        key: "professional_behavior",
        label: "Professional Behavior",
        value: Number(reviewSummary.behavior_rating || 0),
      },
    ].map((item) => ({
      ...item,
      outOf: 5,
      percentage: Number(((item.value / 5) * 100).toFixed(0)),
    }));

    const normalizedReviews = reviews.map((item) => ({
      id: item.id,
      name: item.customer_name || "Unknown Customer",
      rating: Number(item.overall_rating || 0),
      comment: item.comment || "",
      createdAt: item.created_at,
      initials: this.buildReviewInitials(item.customer_name) || "CU",
    }));

    const normalizedTransactions = transactions.map((item) => {
      const totalPaid = this.roundMoney(item.amount_paid);
      const commission = this.roundMoney(
        totalPaid * this.COMMISSION_RATE
      );

      return {
        booking_id: Number(item.booking_id),
        created_at: item.created_at,
        paid_at: item.latest_paid_at,
        total_paid: totalPaid,
        commission,
        net_payout: this.roundMoney(totalPaid - commission),
      };
    });

    return {
      found: true,
      profile,
      overallRating: {
        value: overallRatingValue,
        outOf: 5,
        totalRatings: totalReviews,
      },
      detailedRatings,
      reviews: normalizedReviews,
      transactions: normalizedTransactions,
    };
  }

  static async createFixer(db, payload = {}, file = null) {
    const fullName = this.toOptionalString(payload.fullName);
    const email = this.toOptionalString(payload.email)?.toLowerCase();
    const password =
      this.toOptionalString(payload.password) || this.DEFAULT_FIXER_PASSWORD;
    const phone = this.toOptionalString(payload.phone);
    const companyName = this.toOptionalString(payload.companyName);
    const location = this.toOptionalString(payload.location);
    const bio = this.toOptionalString(payload.bio);
    const profileImageFile = file?.profile_img || null;
    const qrFile = file?.qr || null;

    if (!fullName || !email) {
      throw new Error("Full name and email are required");
    }

    const experienceRaw = this.toOptionalString(payload.experience);
    const experience =
      experienceRaw === null ? null : Number.parseInt(experienceRaw, 10);

    if (
      experienceRaw !== null &&
      (!Number.isFinite(experience) || Number.isNaN(experience) || experience < 0)
    ) {
      throw new Error("Experience must be a valid non-negative number");
    }

    const categoryIds = this.parseCategoryIds(payload.categoryIds);

    const [existingRows] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (existingRows.length > 0) {
      throw new Error("Email already exists");
    }

    const { latitude, longitude } = await this.resolveCoordinates(
      payload,
      location
    );
    const resolvedLocation =
      location || (latitude !== null && longitude !== null
        ? `${latitude}, ${longitude}`
        : null);

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (profileImageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(profileImageFile.mimetype)) {
        throw new Error("Profile image must be JPG, PNG, or WEBP");
      }
    }

    if (qrFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(qrFile.mimetype)) {
        throw new Error("QR image must be JPG, PNG, or WEBP");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImg = profileImageFile?.buffer || null;
    const qr = qrFile?.buffer || null;

    const createPayload = {
      fullName,
      email,
      phone,
      profileImg,
      hashedPassword,
      companyName,
      location: resolvedLocation,
      latitude,
      longitude,
      experience,
      bio,
      qr,
      categoryIds,
    };

    let result;
    try {
      result = await FixerManagementModel.createFixer(db, createPayload);
    } catch (error) {
      if ((profileImg || qr) && this.isLikelyConnectionResetError(error)) {
        throw new Error(
          "Unable to save uploaded image. Please use a smaller image and try again",
          { cause: error }
        );
      }
      throw error;
    }

    return {
      ...result,
    };
  }

  static async updateFixer(db, providerId, payload, file = null) {
    if (!providerId) {
      throw new Error("providerId is required");
    }

    const categoryIds = this.parseCategoryIds(payload.categoryIds);
    const nextPassword = this.toOptionalString(payload.password);
    const experienceRaw = this.toOptionalString(payload.experience);
    const experience =
      experienceRaw === null ? null : Number.parseInt(experienceRaw, 10);
    const profileImageFile = file?.profile_img || null;
    const qrFile = file?.qr || null;

    if (nextPassword && nextPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (
      experienceRaw !== null &&
      (!Number.isFinite(experience) || Number.isNaN(experience) || experience < 0)
    ) {
      throw new Error("Experience must be a valid non-negative number");
    }

    if (profileImageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(profileImageFile.mimetype)) {
        throw new Error("Profile image must be JPG, PNG, or WEBP");
      }
    }

    if (qrFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(qrFile.mimetype)) {
        throw new Error("QR image must be JPG, PNG, or WEBP");
      }
    }

    let providerRows;
    try {
      [providerRows] = await db.query(
        "SELECT id, location, latitude, longitude FROM service_providers WHERE id = ? LIMIT 1",
        [providerId]
      );
    } catch (error) {
      if (error?.code !== "ER_BAD_FIELD_ERROR") {
        throw error;
      }

      [providerRows] = await db.query(
        "SELECT id, location FROM service_providers WHERE id = ? LIMIT 1",
        [providerId]
      );
    }

    if (providerRows.length === 0) {
      return { found: false };
    }

    const nextLocation = this.toOptionalString(payload.location);
    const currentLocation = this.toOptionalString(providerRows[0].location);
    const currentLatitude =
      providerRows[0].latitude === null || providerRows[0].latitude === undefined
        ? null
        : Number(providerRows[0].latitude);
    const currentLongitude =
      providerRows[0].longitude === null || providerRows[0].longitude === undefined
        ? null
        : Number(providerRows[0].longitude);

    const coordinatePayload = {
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    const parsedLatitude = this.parseCoordinateValue(
      coordinatePayload.latitude,
      "Latitude"
    );
    const parsedLongitude = this.parseCoordinateValue(
      coordinatePayload.longitude,
      "Longitude"
    );
    const hasLatitude = parsedLatitude !== null;
    const hasLongitude = parsedLongitude !== null;

    if (hasLatitude !== hasLongitude) {
      throw new Error("Latitude and longitude must be provided together");
    }

    let latitude;
    let longitude;

    if (hasLatitude && hasLongitude) {
      this.validateCoordinateRange(parsedLatitude, parsedLongitude);
      latitude = parsedLatitude;
      longitude = parsedLongitude;
    } else if (nextLocation && nextLocation !== currentLocation) {
      const coordinates = await this.geocodeLocation(nextLocation);
      latitude = coordinates.latitude;
      longitude = coordinates.longitude;
    } else {
      latitude = currentLatitude;
      longitude = currentLongitude;
    }

    const resolvedLocation =
      nextLocation ||
      currentLocation ||
      (latitude !== null && longitude !== null ? `${latitude}, ${longitude}` : null);

    let result;
    try {
      const hashedPassword = nextPassword
        ? await bcrypt.hash(nextPassword, 10)
        : null;

      result = await FixerManagementModel.updateFixer(db, providerId, {
        fullName: payload.fullName,
        email: payload.email,
        hashedPassword,
        phone: payload.phone,
        profileImg: profileImageFile?.buffer || null,
        companyName: payload.companyName,
        location: resolvedLocation,
        latitude,
        longitude,
        experience,
        bio: payload.bio,
        qr: qrFile?.buffer || null,
        categoryIds,
      });
    } catch (error) {
      if ((profileImageFile?.buffer || qrFile?.buffer) && this.isLikelyConnectionResetError(error)) {
        throw new Error(
          "Unable to save uploaded image. Please use a smaller image and try again",
          { cause: error }
        );
      }
      throw error;
    }

    return result;
  }

  static async deleteFixer(db, providerId) {
    if (!providerId) {
      throw new Error("providerId is required");
    }
    return await FixerManagementModel.deleteFixer(db, providerId);
  }
}

module.exports = FixerManagementService;
