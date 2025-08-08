import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  isLoading: false,
  reviews: [],
};
export const addReview = createAsyncThunk("/review/addReview", async (data) => {
  // console.log(data);

  const result = await axios.post(`${API_URL}/api/shop/review/add`, data);
  return result?.data;
});

export const getReviews = createAsyncThunk("/review/getReviews", async (id) => {
  const result = await axios.get(`${API_URL}/api/shop/review/get/${id}`);
  return result?.data;
});

const reviewSLice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
        toast({
          title: "Review added successfully!",
          description: "Thank you for your feedback.",
          className: "bg-green-500 text-white",
        });
      })
      .addCase(addReview.rejected, (state) => {
        state.isLoading = false;
        toast({
          title: "Failed to add review",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
        toast({
          title: "Failed to load reviews",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      });
  },
});

export default reviewSLice.reducer;
