const express = require("express");
const {
  getAllOrdersByUser,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");

const router = express.Router();

router.get("/get", getAllOrdersByUser);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put('/update/:id',updateOrderStatus)

module.exports = router;
