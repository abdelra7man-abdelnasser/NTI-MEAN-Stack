const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const dbConnect = require("./config/db-connect");
const { verifyToken } = require("./middlewares/auth-middleware");
const { verifyAdmin } = require("./middlewares/admin-middleware");

// ── Route imports ──────────────────────────────────────────────────────────────
const authRouter = require("./routes/auth-routes");
const userRouter = require("./routes/user-routes");
const productRouter = require("./routes/product-routes");
const categoryRouter = require("./routes/category-routes");
const cartRouter = require("./routes/cart-routes");
const orderRouter = require("./routes/order-routes");
const adminRouter = require("./routes/admin-routes");

// ── App setup ──────────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
  origin: "http://localhost:4200", // Angular dev server
  credentials: true,              // Allow cookies (refresh token)
}));
app.use(express.json());
app.use(cookieParser());

// ── Database connection ────────────────────────────────────────────────────────
dbConnect();

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",       authRouter);
app.use("/api/v1/users",      verifyToken, userRouter);
app.use("/api/v1/products",   productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/cart",       verifyToken, cartRouter);
app.use("/api/v1/orders",     verifyToken, orderRouter);
app.use("/api/v1/admin",      verifyToken, verifyAdmin, adminRouter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "Thaghr Market API is running." });
});

// ── Global 404 handler ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
