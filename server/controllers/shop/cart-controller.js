const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};
const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // **IMP****

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "cart not found",
      });
    }

    // This filter removes cart items where the referenced product no longer exists in the database.

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // as in cart items.productid is reference to that so in actual we need to go more inside in product like id,image

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};
const updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    // console.log(userId,productId,quantity);

    if (!userId || !productId || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "cart not found",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "cartItem not found",
      });
    }

    if (quantity === 0) {
      cart.items.splice(findCurrentProductIndex, 1);
    } else {
      cart.items[findCurrentProductIndex].quantity = quantity;
    }

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });
    
    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "cart not found",
      });
    }
    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItem,
  fetchCartItems,
  deleteCartItem,
};

/*
  why populate is used ?
  The populate() method is used here to replace references with actual data from related collections
  without populate it will be like this 
  *Output:**
{
  _id: "cart123",
  userId: "user456",
  items: [
    {
      productId: "6877c51d1bba4eb8bf358b11", // ❌ Just an ObjectId reference
      quantity: 2
    },
    {
      productId: "6877c6ed1bba4eb8bf358b15", // ❌ Just an ObjectId reference  
      quantity: 1
    }
  ]
}

with populate 
  
* Output:
{
  _id: "cart123",
  userId: "user456", 
  items: [
    {
      productId: { // ✅ Full product object with selected fields
        _id: "6877c51d1bba4eb8bf358b11",
        image: "http://cloudinary.com/image1.jpg",
        title: "Product One",
        price: 100,
        salePrice: 80
      },
      quantity: 2
    },
    {
      productId: { // ✅ Full product object with selected fields
        _id: "6877c6ed1bba4eb8bf358b15", 
        image: "http://cloudinary.com/image2.jpg",
        title: "Product Two",
        price: 200,
        salePrice: 150
      },
      quantity: 1
    }
  ]
}




*/
