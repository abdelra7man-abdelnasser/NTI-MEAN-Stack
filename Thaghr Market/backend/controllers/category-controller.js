const { validationResult } = require("express-validator");
const Category = require("../models/category-model");

/**
 * @route  GET /api/v1/categories
 * @access Public
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("getAllCategories error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  GET /api/v1/categories/:id
 * @access Public
 */
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("getCategoryById error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  POST /api/v1/categories
 * @access Admin only
 */
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { name, description, imageUrl } = req.body;
    const category = await Category.create({ name, description, imageUrl });
    return res.status(201).json({ success: true, message: "Category created.", category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category name already exists." });
    }
    console.error("createCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  PATCH /api/v1/categories/:id
 * @access Admin only
 */
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    return res.status(200).json({ success: true, message: "Category updated.", category });
  } catch (error) {
    console.error("updateCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  DELETE /api/v1/categories/:id
 * @access Admin only
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    return res.status(200).json({ success: true, message: "Category deleted." });
  } catch (error) {
    console.error("deleteCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
