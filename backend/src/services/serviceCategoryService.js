const ServiceCategoryModel = require("../models/serviceCategoryModel");
const FixerDashboardModel = require("../models/fixerDashboardModel");

class ServiceCategoryService {
  static async enrichProviders(db, providers) {
    return await Promise.all(
      providers.map(async (provider) => {
        if (!provider?.provider_id) {
          return {
            ...provider,
            overall_rating: 0,
            total_ratings: 0,
            reviews: [],
          };
        }

        const [summary, feedback] = await Promise.all([
          FixerDashboardModel.getRatingSummary(db, provider.provider_id),
          FixerDashboardModel.getRecentFeedback(db, provider.provider_id, 20),
        ]);

        return {
          ...provider,
          overall_rating: Number(summary?.overall_rating || 0),
          total_ratings: Number(summary?.total_ratings || 0),
          reviews: feedback.map((item) => ({
            id: item.id,
            customer_name: item.customer_name,
            overall_rating: Number(item.overall_rating || 0),
            comment: item.comment,
            created_at: item.created_at,
          })),
        };
      })
    );
  }

  static async getAllCategories(db) {
    const categories = await ServiceCategoryModel.getAllCategories(db);

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      imageUrl: (cat.image && Buffer.isBuffer(cat.image))
        ? `data:image/jpeg;base64,${cat.image.toString("base64")}`
        : null
    }));
  }

  static async getAvailableCategories(db) {
    const categories = await ServiceCategoryModel.getAvailableCategories(db);

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      prosCount: Number(cat.pros_count || 0),
      imageUrl: (cat.image && Buffer.isBuffer(cat.image))
        ? `data:image/jpeg;base64,${cat.image.toString("base64")}`
        : null
    }));
  }

  static async allProvidersByCategory(db, categoryId) {
    return await ServiceCategoryModel.allProvidersByCategory(db, categoryId);
  }

  static async getAllProvidersByCategory(db, categoryId) {
    const providers = await ServiceCategoryModel.allProvidersByCategory(db, categoryId);
    return await this.enrichProviders(db, providers);
  }

  static async createCategory(db, data, file) {
    if (!data) {
      throw new Error("Name and description are required");
    }
    const { name, description } = data;
    const image = file ? file.buffer : null;

    if (!name || !description) throw new Error("Name and description are required");

    const existing = await ServiceCategoryModel.findCategory(db, name);
    if (existing) throw new Error("Category name already exists");

    const result = await ServiceCategoryModel.createCategory(db, { name, description, image });

    return { message: "Category created successfully", id: result.insertId };
  }

  static async findCategory(db, name) {
    if (!name) throw new Error("Query parameter 'name' is required");

    const category = await ServiceCategoryModel.findCategory(db, name);
    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      hasImage: !!category.image
    };
  }

  static async updateCategory(db, id, data, file) {
    if (!data) {
      throw new Error("Name and description are required");
    }

    const { name, description } = data;
    if (!name || !description) {
      throw new Error("Name and description are required");
    }

    const image = file ? file.buffer : null;

    const existing = await ServiceCategoryModel.findCategory(db, name);
    if (existing && existing.id !== Number(id)) {
      throw new Error("Category name already exists");
    }

    const result = await ServiceCategoryModel.updateCategory(db, id, { name, description, image });

    if (result.affectedRows === 0) return null;

    return { message: "Category updated successfully" };
  }

  static async deleteCategory(db, id) {
    const result = await ServiceCategoryModel.deleteCategory(db, id);

    if (result.affectedRows === 0) return null;

    return { message: "Category deleted successfully" };
  }

  static async nearProvidersEachCategory(db, categoryId, latitude, longitude) {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      throw { status: 400, message: "latitude and longitude are required" };
    }

    const providers = await ServiceCategoryModel.nearProvidersByCategory(db, categoryId, parsedLatitude, parsedLongitude);
    return await this.enrichProviders(db, providers);
  }

  static async getProvidersByCategory(db, categoryId, latitude, longitude) {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)) {
      return await ServiceCategoryService.nearProvidersEachCategory(
        db,
        categoryId,
        parsedLatitude,
        parsedLongitude
      );
    }

    const providers = await ServiceCategoryModel.allProvidersByCategory(db, categoryId);
    return await this.enrichProviders(db, providers);
  }
}

module.exports = ServiceCategoryService;
