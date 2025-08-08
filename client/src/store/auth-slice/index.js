import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

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
        toast({
          title: "Registration successful!",
          description: "Please login with your credentials.",
          className: "bg-green-500 text-white",
        });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        toast({
          title: "Registration failed",
          description: action.payload?.message || "Please try again later.",
          variant: "destructive",
        });
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
        if (action.payload.success) {
          toast({
            title: "Welcome back!",
            description: `Hello ${action.payload.user?.userName}, you're successfully logged in.`,
            className: "bg-green-500 text-white",
          });
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        sessionStorage.removeItem("token");
        toast({
          title: "Login failed",
          description:
            action.payload?.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
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
        toast({
          title: "Logged out successfully",
          description: "See you next time!",
          className: "bg-blue-500 text-white",
        });
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        sessionStorage.removeItem("token");
        toast({
          title: "Logged out",
          description: "You have been logged out.",
          className: "bg-blue-500 text-white",
        });
      });
  },
});

export const { setUser, resetTokenAndCredentials, setLoadingFalse } =
  authSlice.actions;
export default authSlice.reducer;
