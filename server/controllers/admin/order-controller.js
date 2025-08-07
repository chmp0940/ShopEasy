const Order = require("../../models/Order");

const getAllOrdersByUser = async (req, res) => {
  try {
    // console.log(userId);

    const orders = await Order.find({});
    // console.log(orders);

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No Orders Found",
      });
    }

    res.status(201).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some Error Occured",
    });
  }
};
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some Error Occured",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const {id}=req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(id,{orderStatus});
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    order.save();

    res.status(200).json({
      success: true,
      message:'Order updated Succesfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some Error Occured",
    });
  }
};

module.exports = { getAllOrdersByUser, getOrderDetailsForAdmin ,updateOrderStatus};
