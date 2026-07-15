const express = require("express");
const { body } = require("express-validator");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category-controller");
const { verifyToken } = require("../middlewares/auth-middleware");
const { verifyAdmin } = require("../middlewares/admin-middleware");

const router = express.Router();

const categoryRules = [
  body("name").trim().notEmpty().withMessage("Category name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
];

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/", verifyToken, verifyAdmin, categoryRules, createCategory);
router.patch("/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

module.exports = router;
