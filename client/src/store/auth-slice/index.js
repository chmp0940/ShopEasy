import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

/*
Thunk in Redux is used to handle asynchronous logic (like API calls) inside Redux actions.
Normally, Redux actions must be plain objects and can’t contain async code.
With thunk middleware, you can write action creators that return a function (a "thunk") instead of an action object.
This function can perform async operations and then dispatch actions when the async work is done.
*/

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData,
        {
          withCredentials: true,

          //This ensures any cookies set by your backend (like Set-Cookie) are sent and received properly.
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

        //This ensures any cookies set by your backend (like Set-Cookie) are sent and received properly.
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",
  async (_, { rejectWithValue }) => {
    // Add the second parameter
    try {
      const response = await axios.get(`${API_URL}/api/auth/check-auth`, {
        withCredentials: true,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
      return response.data;
    } catch (error) {
      // This prevents the ZodError on first visit
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const logoutUser = createAsyncThunk("/auth/logout", async () => {
  {
    const response = await axios.post(
      `${API_URL}/api/auth/logout`,
      {},
      {
        withCredentials: true,

        //This ensures any cookies set by your backend (like Set-Cookie) are sent and received properly.
      }
    );
    return response.data;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
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
        // console.log(action.payload);
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log(action.payload);
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state, ) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});
export const { setUser } = authSlice.actions;
export default authSlice.reducer;

/*
Why are extraReducers used?
extraReducers in Redux Toolkit's createSlice are used to handle actions that are not defined in the slice's own reducers.
Most commonly, they are used to handle the different states (pending, fulfilled, rejected) of async thunks like createAsyncThunk.

For example, when you use registerUser, Redux Toolkit automatically creates actions for:

registerUser/pending
registerUser/fulfilled
registerUser/rejected
You use extraReducers to tell your slice how to update the state when these actions happen.
*/
