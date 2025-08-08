import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialState = {
  isLoading: false,
  addressList: [],
};

export const addNewAddress = createAsyncThunk(
  "/addresses/addNewAddress",

  async (formData) => {
    // console.log(formData);
    const response = await axios.post(
      `${API_URL}/api/shop/address/add`,
      formData
    );
    return response.data;
  }
);
export const fetchAllAddress = createAsyncThunk(
  "/addresses/fetchAllAddress",
  async (userId) => {
    // console.log(userId);

    const response = await axios.get(
      `${API_URL}/api/shop/address/get/${userId}`
    );
    return response.data;
  }
);
export const editAddress = createAsyncThunk(
  "/addresses/editAddress",
  async ({ formData, userId, addressId }) => {
    const response = await axios.put(
      `${API_URL}/api/shop/address/update/${userId}/${addressId}`,
      formData
    );
    return response.data;
  }
);
export const deleteAddress = createAsyncThunk(
  "/addresses/deleteAddress",
  async ({ userId, addressId }) => {
    console.log(userId, addressId);

    const response = await axios.delete(
      `${API_URL}/api/shop/address/delete/${userId}/${addressId}`
    );
    return response.data;
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewAddress.fulfilled, (state) => {
        // console.log(action.payload.data);

        state.isLoading = false;
        toast({
          title: "Address added successfully!",
          description: "Your new address has been saved.",
          className: "bg-green-500 text-white",
        });
      })
      .addCase(addNewAddress.rejected, (state) => {
        state.isLoading = false;
        toast({
          title: "Failed to add address",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .addCase(fetchAllAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(fetchAllAddress.rejected, (state) => {
        state.isLoading = false;
        state.addressList = [];
        toast({
          title: "Failed to load addresses",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      })
      .addCase(editAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editAddress.fulfilled, (state) => {
        state.isLoading = false;
        toast({
          title: "Address updated successfully!",
          description: "Your address has been updated.",
          className: "bg-blue-500 text-white",
        });
      })
      .addCase(editAddress.rejected, (state) => {
        state.isLoading = false;
        toast({
          title: "Failed to update address",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAddress.fulfilled, (state) => {
        state.isLoading = false;
        toast({
          title: "Address deleted successfully!",
          description: "The address has been removed.",
          className: "bg-orange-500 text-white",
        });
      })
      .addCase(deleteAddress.rejected, (state) => {
        state.isLoading = false;
        toast({
          title: "Failed to delete address",
          description: "Please try again later.",
          variant: "destructive",
        });
      });
  },
});

export default addressSlice.reducer;
