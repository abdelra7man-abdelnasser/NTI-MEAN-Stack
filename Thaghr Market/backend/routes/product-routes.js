const express = require("express");
const { body } = require("express-validator");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
} = require("../controllers/product-controller");
const { verifyToken } = require("../middlewares/auth-middleware");
const { verifyAdmin } = require("../middlewares/admin-middleware");

const router = express.Router();

// ── Validation rules ──────────────────────────────────────────────────────────

const productRules = [
  body("title").trim().notEmpty().withMessage("Title is required")
    .isLength({ max: 150 }).withMessage("Title cannot exceed 150 characters"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("category").notEmpty().withMessage("Category is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// NOTE: /search and /filter must be placed BEFORE /:id to avoid route conflicts
router.get("/search", searchProducts);
router.get("/filter", filterProducts);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", verifyToken, verifyAdmin, productRules, createProduct);
router.patch("/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

module.exports = router;
