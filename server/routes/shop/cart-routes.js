const express=require('express');
const {
  addToCart,
  updateCartItem,
  fetchCartItems,
  deleteCartItem
} = require("../../controllers/shop/cart-controller");

const router=express.Router();

router.post('/add',addToCart);
router.get('/get/:userId',fetchCartItems);
router.put('/update-cart/',updateCartItem);
router.delete('/:userId/:productId',deleteCartItem)

module.exports=router;