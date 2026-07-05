// Middleware to restrict write operations to admin-only
// Viewers (role === "viewer") can access admin pages but cannot modify data
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied! Admin privileges required for this action.",
    });
  }

  next();
};

module.exports = { adminOnly };
