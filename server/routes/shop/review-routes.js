const express = require("express");
const {
  getProductReviews,
  addProductReviews,
} = require("../../controllers/shop/product-review-controller");

const router = express.Router();

router.post("/add", addProductReviews);
router.get("/get/:productId", getProductReviews);


module.exports = router;
