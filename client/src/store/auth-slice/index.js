import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check-auth`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    resetTokenAndCredentials: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      sessionStorage.removeItem("token");
    },
    setLoadingFalse: (state) => {
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        state.token = action.payload.token;
        if (action.payload.token) {
          sessionStorage.setItem("token", JSON.stringify(action.payload.token));
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        sessionStorage.removeItem("token");
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log("checkAuth fulfilled:", action.payload);
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.log("checkAuth rejected:", action.payload);
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        // Only clear token if it's truly invalid
        if (
          action.payload &&
          action.payload.message?.includes("Unauthorised")
        ) {
          state.token = null;
          sessionStorage.removeItem("token");
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        sessionStorage.removeItem("token");
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        sessionStorage.removeItem("token");
      });
  },
});

export const { setUser, resetTokenAndCredentials, setLoadingFalse } =
  authSlice.actions;
export default authSlice.reducer;
