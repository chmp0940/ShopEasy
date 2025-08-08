import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  cartItems: [],
  isLoading: false,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }) => {
    const response = await axios.post(`${API_URL}/api/shop/cart/add`, {
      userId,
      productId,
      quantity,
    });
    return response.data;
  }
);
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    const response = await axios.get(`${API_URL}/api/shop/cart/get/${userId}`);
    return response.data;
  }
);
export const deleteCartItems = createAsyncThunk(
  "cart/deleteCartItems",
  async ({ userId, productId }) => {
    const response = await axios.delete(
      `${API_URL}/api/shop/cart/${userId}/${productId}`
    );

    return response.data;
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }) => {
    const response = await axios.put(`${API_URL}/api/shop/cart/update-cart`, {
      userId,
      productId,
      quantity,
    });
    return response.data;
  }
);

const shopppingCartSlice = createSlice({
  name: "ShoppingCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        toast({
          title: "Product added to cart!",
          description: "You can view it in your cart.",
          className: "bg-green-500 text-white",
        });
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
        toast({
          title: "Failed to add to cart",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;

        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
        toast({
          title: "Failed to load cart",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        toast({
          title: "Cart updated!",
          description: "Product quantity has been updated.",
          className: "bg-blue-500 text-white",
        });
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
        toast({
          title: "Failed to update cart",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .addCase(deleteCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        toast({
          title: "Product removed from cart",
          description: "The item has been successfully removed.",
          className: "bg-orange-500 text-white",
        });
      })
      .addCase(deleteCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
        toast({
          title: "Failed to remove item",
          description: "Please try again later.",
          variant: "destructive",
        });
      });
  },
});

export default shopppingCartSlice.reducer;
