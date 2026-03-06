const ServiceCategoryModel = require("../models/serviceCategoryModel");

class ServiceCategoryController {

    static async createCategory(req, res) {
        const db = req.app.get("db");
        const { name, description } = req.body;

        try {
            const existing = await ServiceCategoryModel.findCategory(db, name);
            if (existing) return res.status(400).json({ message: "This category already exists" });

            const result = await ServiceCategoryModel.createCategory(db, { name, description });

            res.status(201).json({
                message: "Category created",
                categoryId: result.insertId
            });

        } catch (err) {
            res.status(500).json({
                message: "Create category failed",
                error: err.message
            });
        }
    }
}

module.exports = ServiceCategoryController;

