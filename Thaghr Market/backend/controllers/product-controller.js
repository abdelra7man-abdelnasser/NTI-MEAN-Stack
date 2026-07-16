const { validationResult } = require("express-validator");
const Product = require("../models/product-model");

/**
 * @route  GET /api/v1/products
 
 */
const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  GET /api/v1/products/:id
 
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name description");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("getProductById error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  POST /api/v1/products

 */
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { title, description, price, category, stock, imageUrl } = req.body;
    const product = await Product.create({ title, description, price, category, stock, imageUrl });

    return res.status(201).json({ success: true, message: "Product created.", product });
  } catch (error) {
    console.error("createProduct error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  PATCH /api/v1/products/:id
 * @access Admin only
 */
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({ success: true, message: "Product updated.", product });
  } catch (error) {
    console.error("updateProduct error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  DELETE /api/v1/products/:id
 * @access Admin only
 * @desc   Delete a product by ID
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    return res.status(200).json({ success: true, message: "Product deleted." });
  } catch (error) {
    console.error("deleteProduct error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  GET /api/v1/products/search?q=keyword
 * @access Public
 * @desc   Task 7 — Full-text search on title and description
 */
const searchProducts = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).populate("category", "name");

    return res.status(200).json({ success: true, total: products.length, products });
  } catch (error) {
    console.error("searchProducts error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  GET /api/v1/products/filter?category=&minPrice=&maxPrice=&rating=
 
 */
const filterProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, rating, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (rating) query.rating = { $gte: parseFloat(rating) };

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (error) {
    console.error("filterProducts error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
};
