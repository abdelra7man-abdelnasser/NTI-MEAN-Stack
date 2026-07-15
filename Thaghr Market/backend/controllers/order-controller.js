const { validationResult } = require("express-validator");
const Order = require("../models/order-model");
const Cart = require("../models/cart-model");
const Product = require("../models/product-model");

/**
 * @route  POST /api/v1/orders
 * @access Protected
 * @desc   Create an order from the user's current cart, then clear the cart
 */
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { shippingAddress, paymentMethod = "card" } = req.body;

    // 1. Load cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    // 2. Validate stock for each item
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ success: false, message: "A product in your cart no longer exists." });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.title}". Only ${item.product.stock} left.`,
        });
      }
    }

    // 3. Snapshot items for the order
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
    }));

    // 4. Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice: cart.totalPrice,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        paid: paymentMethod === "card",
        paidAt: paymentMethod === "card" ? new Date() : undefined,
      },
    });

    // 5. Decrement stock for each product
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // 6. Clear the cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({ success: true, message: "Order placed successfully.", order });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  GET /api/v1/orders
 * @access Protected
 * @desc   Get all orders for the logged-in user
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title imageUrl price")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  GET /api/v1/orders/:id
 * @access Protected
 * @desc   Get a single order by ID (user must own it)
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate("items.product", "title imageUrl price")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("getOrderById error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  PATCH /api/v1/orders/:id/cancel
 * @access Protected
 * @desc   Cancel a pending or processing order
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status "${order.status}".`,
      });
    }

    order.status = "cancelled";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    return res.status(200).json({ success: true, message: "Order cancelled.", order });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
