const ServiceCategoryModel = require("../models/serviceCategoryModel");
const fs = require("fs");
const path = require("path");

class ServiceCategoryController {

    static async getAllCategories(req, res) {
        const db = req.app.get("db");
        try {
            const categories = await ServiceCategoryModel.getAllCategories(db);
            const data = categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                description: cat.description,
                imageUrl: cat.image ? `data:image/jpeg;base64,${cat.image.toString('base64')}` : null
            }));
            res.status(200).json({ data });
        } catch (err) {
            res.status(500).json({
                message: "Get all categories failed",
                error: err.message
            });
        }
    }

    static async createCategory(req, res) {
        try {
            const db = req.app.get("db");
            const { name, description } = req.body;
            const image = req.file ? req.file.buffer : null;

            if (!name || !description) {
                return res.status(400).json({
                    message: "Name and description are required"
                });
            }

            const existing = await ServiceCategoryModel.findCategory(db, name);
            if (existing) {
                return res.status(400).json({
                    message: "Category name already exists"
                });
            }

            const result = await ServiceCategoryModel.createCategory(db, {
                name,
                description,
                image
            });

            res.status(201).json({
                message: "Category created successfully",
                id: result.insertId
            });

        } catch (error) {
            res.status(500).json({
                message: "Create category failed",
                error: error.message
            });
        }
    }

    static async findCategory(req, res) {
        const db = req.app.get("db");
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                message: "Query parameter 'name' is required"
            });
        }

        try {
            const category = await ServiceCategoryModel.findCategory(db, name);

            if (!category) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            res.status(200).json({
                id: category.id,
                name: category.name,
                description: category.description,
                hasImage: !!category.image
            });
        } catch (err) {
            res.status(500).json({
                message: "Find category failed",
                error: err.message
            });
        }
    }

    static async updateCategory(req, res) {
        const db = req.app.get("db");
        const { id } = req.params;
        const { name, description } = req.body;

        const image = req.file ? req.file.buffer : null;

        try {
            if (!name || !description) {
                return res.status(400).json({
                    message: "Name and description are required"
                });
            }

            const existing = await ServiceCategoryModel.findCategory(db, name);

            // Check if another category already uses this name
            if (existing && existing.id != id) {
                return res.status(400).json({
                    message: "Category name already exists"
                });
            }

            const result = await ServiceCategoryModel.updateCategory(db, id, {
                name,
                description,
                image
            });

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

    static async deleteCategory(req, res) {
        const db = req.app.get("db");
        const { id } = req.params;

        try {
            const result = await ServiceCategoryModel.deleteCategory(db, id);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            res.status(200).json({
                message: "Category deleted successfully"
            });
        } catch (err) {
            res.status(500).json({
                message: "Delete category failed",
                error: err.message
            });
        }
    }
}

module.exports = ServiceCategoryController;

