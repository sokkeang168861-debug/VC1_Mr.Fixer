const ServiceCategoryService = require("../services/serviceCategoryService");

const ValidationErrors = new Set([
  "Name and description are required",
  "Category name already exists",
  "Query parameter 'name' is required"
]);

class ServiceCategoryController {
  static _db(req) {
    return req.app.get("db");
  }

  static _logRequest(action, req) {
    const isFile = req.file
      ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        }
      : "No file";

    console.info(`ServiceCategoryController: ${action}`);
    console.info("req.body:", req.body);
    console.info("req.file:", isFile);
  }

  static _handleError(res, err, fallbackMessage) {
    if (!err) {
      return res.status(500).json({ message: fallbackMessage });
    }

    if (typeof err === "object" && err.status && Number.isInteger(err.status)) {
      return res.status(err.status).json({ message: err.message || fallbackMessage });
    }

    if (err instanceof Error && ValidationErrors.has(err.message)) {
      return res.status(400).json({ message: err.message });
    }

    console.error(fallbackMessage + ":", err);
    return res.status(500).json({ message: fallbackMessage, error: err.message || err });
  }

  static async getAllCategories(req, res) {
    try {
      const data = await ServiceCategoryService.getAllCategories(this._db(req));
      return res.status(200).json({ data });
    } catch (err) {
      return this._handleError(res, err, "Get all categories failed");
    }
  }

  static async getAvailableCategories(req, res) {
    try {
      const data = await ServiceCategoryService.getAvailableCategories(this._db(req));
      return res.status(200).json({ data });
    } catch (err) {
      return this._handleError(res, err, "Get available categories failed");
    }
  }

  static async allProvidersByCategory(req, res) {
    const { categoryId } = req.params;
    try {
      const providers = await ServiceCategoryService.allProvidersByCategory(this._db(req), categoryId);
      return res.status(200).json(providers);
    } catch (err) {
      return this._handleError(res, err, "Fetch providers failed");
    }
  }

  static async getNearProvidersByCategory(req, res) {
    const { categoryId } = req.params;
    const { latitude, longitude } = req.query;

    try {
      const providers = await ServiceCategoryService.nearProvidersEachCategory(
        this._db(req),
        categoryId,
        latitude,
        longitude
      );
      return res.status(200).json(providers);
    } catch (err) {
      return this._handleError(res, err, "Fetch providers failed");
    }
  }

  static async getProvidersByCategory(req, res) {
    // Alias to nearProvidersEachCategory through service layer for backward compatibility
    return this.getNearProvidersByCategory(req, res);
  }

  static async createCategory(req, res) {
    this._logRequest("createCategory", req);

    try {
      const result = await ServiceCategoryService.createCategory(this._db(req), req.body, req.file);
      return res.status(201).json(result);
    } catch (err) {
      if (err instanceof Error && ValidationErrors.has(err.message)) {
        return res.status(400).json({ message: err.message });
      }
      return this._handleError(res, err, "Create category failed");
    }
  }

  static async findCategory(req, res) {
    const { name } = req.query;

    try {
      const category = await ServiceCategoryService.findCategory(this._db(req), name);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(200).json(category);
    } catch (err) {
      if (err instanceof Error && err.message === "Query parameter 'name' is required") {
        return res.status(400).json({ message: err.message });
      }
      return this._handleError(res, err, "Find category failed");
    }
  }

  static async updateCategory(req, res) {
    const { id } = req.params;
    this._logRequest(`updateCategory id=${id}`, req);

    try {
      const result = await ServiceCategoryService.updateCategory(this._db(req), id, req.body, req.file);
      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error && ValidationErrors.has(err.message)) {
        return res.status(400).json({ message: err.message });
      }
      return this._handleError(res, err, "Update category failed");
    }
  }

  static async deleteCategory(req, res) {
    const { id } = req.params;

    try {
      const result = await ServiceCategoryService.deleteCategory(this._db(req), id);
      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(200).json(result);
    } catch (err) {
      return this._handleError(res, err, "Delete category failed");
    }
  }
}

module.exports = ServiceCategoryController;
