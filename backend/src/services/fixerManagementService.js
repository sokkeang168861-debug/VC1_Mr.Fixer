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
        categories: categoriesArray,
        totalBookings: item.totalBookings,
        rating: item.overallRating,
        avatar: item.avatar,
      };
    });
  }
}

module.exports = FixerManagementService;
