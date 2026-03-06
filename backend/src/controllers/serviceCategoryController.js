const ServiceCategoryModel = require("../models/serviceCategoryModel");

class ServiceCategoryController {

    static async createCategory(req, res) {
        const db = req.app.get("db");
        const { name, description } = req.body;

        const image = req.file ? req.file.buffer : null;

        try {
            const existing = await ServiceCategoryModel.findCategory(db, name);
            if (existing) return res.status(400).json({ message: "This category already exists" });

            const result = await ServiceCategoryModel.createCategory(db, {
                name,
                description,
                image
            });

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

    static async updateCategory(req, res) {
        const db = req.app.get("db");
        const { id } = req.params;
        const { name, description } = req.body;

        try {

            const existing = await ServiceCategoryModel.findCategory(db, name);

            // Check if another category already uses this name
            if (existing && existing.id != id) {
                return res.status(400).json({
                    message: "Category name already exists"
                });
            }

            const result = await ServiceCategoryModel.updateCategory(db, id, { name, description });

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            res.status(200).json({
                message: "Category updated successfully"
            });

        } catch (err) {
            res.status(500).json({
                message: "Update category failed",
                error: err.message
            });
        }
    }
}

module.exports = ServiceCategoryController;

