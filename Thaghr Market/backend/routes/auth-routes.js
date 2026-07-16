const express = require("express");
const { body } = require("express-validator");
const { register, login, logout, refreshToken } = require("../controllers/auth-controller");

const router = express.Router();



const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

module.exports = router;
