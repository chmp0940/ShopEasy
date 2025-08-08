import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  approvalUrl: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    // console.log(orderData);

    const response = await axios.post(
      `${API_URL}/api/shop/order/create`,
      orderData
    );

    return response.data;
  }
);
export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }) => {
    // console.log(orderData);

    const response = await axios.post(`${API_URL}/api/shop/order/capture`, {
      paymentId,
      payerId,
      orderId,
    });

    return response.data;
  }
);
export const getAllOrderByUserId = createAsyncThunk(
  "/order/getAllOrderByUserId",
  async (userId) => {
    const response = await axios.get(
      `${API_URL}/api/shop/order/list/${userId}`
    );

    return response.data;
  }
);
export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(`${API_URL}/api/shop/order/details/${id}`);
    // console.log(response?.data);

    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalUrl = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
        toast({
          title: "Order created successfully!",
          description: "Redirecting to payment...",
          className: "bg-green-500 text-white",
        });
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalUrl = null;
        state.orderId = null;
        toast({
          title: "Failed to create order",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .addCase(capturePayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(capturePayment.fulfilled, (state) => {
        state.isLoading = false;
        toast({
          title: "Payment successful!",
          description: "Your order has been confirmed.",
          className: "bg-green-500 text-white",
        });
      })
      .addCase(capturePayment.rejected, (state) => {
        state.isLoading = false;
        toast({
          title: "Payment failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      })
      .addCase(getAllOrderByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrderByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrderByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
        toast({
          title: "Failed to load orders",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = [];
        toast({
          title: "Failed to load order details",
          description: "Please try again later.",
          variant: "destructive",
        });
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
