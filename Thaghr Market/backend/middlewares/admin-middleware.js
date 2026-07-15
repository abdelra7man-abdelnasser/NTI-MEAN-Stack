/**
 * verifyAdmin middleware
 * Must run AFTER verifyToken (req.user must be set).
 * Rejects non-admin users with 403 Forbidden.
 */
const verifyAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  
};

module.exports = { verifyAdmin };
