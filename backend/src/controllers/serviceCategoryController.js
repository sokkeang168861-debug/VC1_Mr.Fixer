const ServiceCategoryService = require("../services/serviceCategoryService");

class ServiceCategoryController {

  static async getAllCategories(req, res) {
    const db = req.app.get("db");

    try {
      const data = await ServiceCategoryService.getAllCategories(db);
      res.status(200).json({ data });
    } catch (err) {
      console.error("Get All Categories Error:", err);
      res.status(500).json({
        message: "Get all categories failed",
        error: err.message
      });
    }
  }

  static async createCategory(req, res) {
    const db = req.app.get("db");
    console.log("Controller: createCategory called");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file");

    try {
      const result = await ServiceCategoryService.createCategory(db, req.body, req.file);
      res.status(201).json(result);
    } catch (err) {
      if (err.message === "Name and description are required" ||
          err.message === "Category name already exists") {
        return res.status(400).json({ message: err.message });
      }

      console.error("Create Category Error:", err);
      res.status(500).json({
        message: "Create category failed",
        error: err.message
      });
    }
  }

  static async findCategory(req, res) {
    const db = req.app.get("db");
    const { name } = req.query;

    try {
      const category = await ServiceCategoryService.findCategory(db, name);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json(category);
    } catch (err) {
      if (err.message === "Query parameter 'name' is required") {
        return res.status(400).json({ message: err.message });
      }

      console.error("Find Category Error:", err);
      res.status(500).json({
        message: "Find category failed",
        error: err.message
      });
    }
  }

  static async updateCategory(req, res) {
    const db = req.app.get("db");
    const { id } = req.params;

    console.log("Controller: updateCategory called for id:", id);
    console.log("req.body:", req.body);
    console.log("req.file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file");

    try {
      const result = await ServiceCategoryService.updateCategory(db, id, req.body, req.file);

      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json(result);
    } catch (err) {
      if (err.message === "Name and description are required" ||
          err.message === "Category name already exists") {
        return res.status(400).json({ message: err.message });
      }

      console.error("Update Category Error:", err);
      res.status(500).json({
        message: "Update category failed",
        error: err.message
      });
    }
  }

  static async deleteCategory(req, res) {
    const db = req.app.get("db");
    const { id } = req.params;

    try {
      const result = await ServiceCategoryService.deleteCategory(db, id);

      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json(result);
    } catch (err) {
      console.error("Delete Category Error:", err);
      res.status(500).json({
        message: "Delete category failed",
        error: err.message
      });
    }
  }

  // Fixed providers method
  static async getProvidersByCategory(req, res) {
    const db = req.app.get("db");
    const { categoryId } = req.params;

    try {
      const providers = await ServiceCategoryService.providersEachCategory(db, categoryId);
      res.status(200).json(providers);
    } catch (err) {
      console.error("Fetch Providers Error:", err);
      res.status(500).json({ message: "Failed to fetch providers", error: err.message });
    }
  }
}

module.exports = ServiceCategoryController;