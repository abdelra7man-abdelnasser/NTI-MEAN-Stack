const User = require("../models/user-model");
const Order = require("../models/order-model");
const Product = require("../models/product-model");


 
 //route >>  GET /api/v1/admin/users || access >> Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, total: users.length, users });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};


//  route >> GET /api/v1/admin/users/:id || access >> Admin only
 
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("savedAddresses");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// route >>  DELETE /api/v1/admin/users/:id || access >> Admin only
 
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, message: "User deleted." });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// route >> GET /api/v1/admin/orders || access >> Admin only

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "title price")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, total: orders.length, orders });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  } 
};

// route >> PATCH /api/v1/admin/orders/:id/status || access >> Admin only

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, message: "Order status updated.", order });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// route >> GET /api/v1/admin/stats || access >> Admin only

const getDashboardStats = async (req, res) => {
  try {
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const timeoutMs = Number(process.env.MONGO_QUERY_TIMEOUT_MS) || 5000;

    console.log(`[admin/stats] start id=${requestId} timeoutMs=${timeoutMs}`);
    console.log(`[admin/stats] connected readyState=`, req?.app?._mongoReadyState);

    const [totalUsers, totalProducts, totalOrders, revenueData] = await Promise.all([
      User.countDocuments({}, { maxTimeMS: timeoutMs }),
      Product.countDocuments({}, { maxTimeMS: timeoutMs }),
      Order.countDocuments({}, { maxTimeMS: timeoutMs }),
      Order.aggregate(
        [
          { $match: { status: { $ne: "cancelled" } } },
          { $group: { _id: null, revenue: { $sum: "$totalPrice" } } },
        ],
        { maxTimeMS: timeoutMs }
      ),
    ]);

    console.log(`[admin/stats] db complete id=${requestId}`);
    
    if (totalUsers === 0 && totalProducts === 0 && totalOrders === 0) {
      return res.status(200).json({
        success: true,
        message: "No data available yet.",
        stats: null,
      });
    }     


    const revenue = revenueData.length > 0 ? revenueData[0].revenue : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: parseFloat(revenue.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAllUsers, getUserById, deleteUser, getAllOrders, updateOrderStatus, getDashboardStats };
