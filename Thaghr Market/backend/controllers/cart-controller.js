const Cart = require("../models/cart-model");
const Product = require("../models/product-model");


 // Helper: find or create the cart for the current user.

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
  }
  return cart;
};

/**
 * @route  GET /api/v1/cart

 */
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "title price imageUrl stock"
    );
    if (!cart) {
      return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0 } });
    }
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  POST /api/v1/cart
 
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock available." });
    }

    const cart = await findOrCreateCart(req.user._id);
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      // Update quantity if item already in cart
      cart.items[existingIndex].quantity += quantity;
    } else {
      // Push new item
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save(); // totalPrice recalculated in pre-save hook
    await cart.populate("items.product", "title price imageUrl stock");

    return res.status(200).json({ success: true, message: "Item added to cart.", cart });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  PATCH /api/v1/cart/:productId

 */
const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === req.params.productId
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart." });
    }

    // Stock check
    const product = await Product.findById(req.params.productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock available." });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "title price imageUrl stock");

    return res.status(200).json({ success: true, message: "Quantity updated.", cart });
  } catch (error) {
    console.error("updateQuantity error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  DELETE /api/v1/cart/:productId

 */
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const index = cart.items.findIndex(
      (i) => i.product.toString() === req.params.productId
    );
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart." });
    }

    cart.items.splice(index, 1);
    await cart.save();

    return res.status(200).json({ success: true, message: "Item removed from cart.", cart });
  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  DELETE /api/v1/cart

 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({ success: true, message: "Cart cleared.", cart });
  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };
