import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

export const getFeatureImage = createAsyncThunk(
  "/common/getFeatureImageList",
  async () => {
    const result = await axios.get(`${API_URL}/api/common/feature/get`);
    return result?.data;
  }
);
export const addFeatureImage = createAsyncThunk(
  "/common/addFeatureImage",
  async (image) => {
    // console.log(image);

    const result = await axios.post(`${API_URL}/api/common/feature/add`, {
      image,
    });
    return result?.data;
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImage.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      });
  },
});

export default commonSlice.reducer;
