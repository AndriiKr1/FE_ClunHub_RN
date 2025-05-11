import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../../services/authService";

// Async thunks
export const registerUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      if (error.response) {
        if (
          error.response.status === 409 ||
          (error.response.data?.message &&
            error.response.data.message.includes("already exists"))
        ) {
          return rejectWithValue("User with this email already exists");
        } else if (error.response.status === 400) {
          if (error.response.data?.errors) {
            const errorMessages = Object.entries(error.response.data.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(", ");
            return rejectWithValue(`Validation failed: ${errorMessages}`);
          }
          return rejectWithValue(
            error.response.data?.message || "Invalid registration data"
          );
        }
        return rejectWithValue(
          error.response.data?.message || "Server error occurred"
        );
      }
      return rejectWithValue("Connection error. Please try again later.");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/signin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      if (!response.token || !response.user) {
        return rejectWithValue("invalid_response_format");
      }

      return response;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          if (
            typeof error.response.data === "string" &&
            error.response.data.includes("Invalid email or password")
          ) {
            return rejectWithValue("invalid_credentials");
          }
          return rejectWithValue(error.response.data || "bad_request");
        } else if (error.response.status === 404) {
          return rejectWithValue("user_not_found");
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          return rejectWithValue("invalid_credentials");
        }
        return rejectWithValue(error.response.data || "server_error");
      } else if (error.request) {
        return rejectWithValue("server_unreachable");
      }
      return rejectWithValue("network_error");
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to request password reset"
      );
    }
  }
);

export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.verifyResetCode(data);
      return response;
    } catch (error) {
      if (error.response?.status === 400) {
        return rejectWithValue("invalid_token");
      } else if (error.response?.status === 410) {
        return rejectWithValue("code_expired");
      }
      return rejectWithValue("server_error");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

export const joinFamily = createAsyncThunk(
  "auth/joinFamily",
  async (inviteCode, { rejectWithValue }) => {
    try {
      const response = await authService.joinFamily(inviteCode);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to join family");
    }
  }
);

// Helper function to load user data from AsyncStorage
const loadUserFromStorage = async () => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    const storedToken = await AsyncStorage.getItem("token");

    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
    };
  } catch (error) {
    console.error("Failed to load user data from AsyncStorage:", error);
    return { user: null, token: null };
  }
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  passwordReset: {
    isLinkSent: false,
    isCodeVerified: false,
    isLoading: false,
    error: null,
    message: null,
  },
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordResetState: (state) => {
      state.passwordReset = {
        isLinkSent: false,
        isCodeVerified: false,
        isLoading: false,
        error: null,
        message: null,
      };
    },
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // Store user data in AsyncStorage
        AsyncStorage.setItem("token", action.payload.token);
        AsyncStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Login user
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // Store user data in AsyncStorage
        AsyncStorage.setItem("token", action.payload.token);
        AsyncStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Request password reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordReset.isLoading = true;
        state.passwordReset.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.isLinkSent = true;
        state.passwordReset.message = "Password reset link sent successfully";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.error = action.payload;
      })

      // Verify reset code
      .addCase(verifyResetCode.pending, (state) => {
        state.passwordReset.isLoading = true;
        state.passwordReset.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.isCodeVerified = true;
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.error = action.payload;
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.passwordReset.isLoading = true;
        state.passwordReset.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.message = "Password reset successfully";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.error = action.payload;
      })

      .addCase(joinFamily.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.user };
      });
  },
});

export const { logout, clearError, clearPasswordResetState, setUser } =
  authSlice.actions;

// Initialize auth state from AsyncStorage
export const initializeAuthState = () => async (dispatch) => {
  const userData = await loadUserFromStorage();
  if (userData.token && userData.user) {
    dispatch(setUser({ user: userData.user, token: userData.token }));
  }
};

export default authSlice.reducer;
