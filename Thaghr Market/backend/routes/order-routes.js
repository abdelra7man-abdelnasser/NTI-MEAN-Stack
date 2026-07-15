const express = require("express");
const { body } = require("express-validator");
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require("../controllers/order-controller");

const router = express.Router();

const orderRules = [
  body("shippingAddress.street").trim().notEmpty().withMessage("Street is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
  body("shippingAddress.country").trim().notEmpty().withMessage("Country is required"),
  body("shippingAddress.postalCode").trim().notEmpty().withMessage("Postal code is required"),
];

// All order routes are protected via verifyToken in index.js
router.post("/", orderRules, createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
