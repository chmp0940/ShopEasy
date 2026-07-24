const express = require("express");
const {
  getAllOrdersByUser,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { adminOnly } = require("../../middlewares/auth-middleware");

const router = express.Router();

// Read routes — open to both admin and viewer
router.get("/get", getAllOrdersByUser);
router.get("/details/:id", getOrderDetailsForAdmin);

// Write route — admin only (viewers blocked at server level)
router.put('/update/:id', authMiddleware, adminOnly, updateOrderStatus);

module.exports = router;
