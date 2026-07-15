const express = require("express");
const {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require("../controllers/admin-controller");

const router = express.Router();

// All admin routes are protected via verifyToken + verifyAdmin in index.js

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);

router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

router.get("/stats", getDashboardStats);

module.exports = router;
