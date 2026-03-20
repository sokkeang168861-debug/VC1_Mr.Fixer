const FixerManagementModel = require("../models/fixerManagementModel");

class FixerManagementService {
  static async listFixers(db) {
    const records = await FixerManagementModel.getFixersWithStats(db);

    return records.map((item) => {
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
      experience: item.experience,
      bio: item.bio,
      categories: categoriesArray,
      categoryIds: Array.isArray(item.categoryIds) ? item.categoryIds : [],
      totalBookings: item.totalBookings,
      rating: item.overallRating,
      avatar: item.avatar,
    };
  });
  }

  static async updateFixer(db, providerId, payload) {
    if (!providerId) {
      throw new Error("providerId is required");
    }

    const categoryIds = Array.isArray(payload.categoryIds)
      ? [...new Set(payload.categoryIds.map((id) => Number(id)).filter(Boolean))]
      : [];

    const result = await FixerManagementModel.updateFixer(db, providerId, {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      companyName: payload.companyName,
      location: payload.location,
      experience: payload.experience,
      bio: payload.bio,
      categoryIds,
    });

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
