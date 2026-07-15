const express = require("express");
const { getCart, addToCart, updateQuantity, removeFromCart, clearCart } = require("../controllers/cart-controller");

const router = express.Router();

// All cart routes are protected via verifyToken in index.js
router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:productId", updateQuantity);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
