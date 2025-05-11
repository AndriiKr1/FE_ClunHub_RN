import api from "./api";

export const authService = {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise} API response
   */
  register: async (userData) => {
    const requestData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      age: parseInt(userData.age),
      avatarId: userData.avatar,
      role: userData.role,
    };

    // Add family-specific data based on role
    if (userData.role === "admin") {
      requestData.familyName = userData.familyName;
      requestData.inviteCode = userData.inviteCode;
    } else if (userData.role === "user" && userData.inviteCode) {
      requestData.inviteCode = userData.inviteCode;
    }

    const response = await api.post("/api/auth/sign-up", requestData);
    return response.data;
  },

  /**
   * Login user
   * @param {object} credentials - User login credentials
   * @returns {Promise} API response
   */
  login: async (credentials) => {
    const response = await api.post("/api/auth/sign-in", credentials);
    return response.data;
  },

  /**
   * Join family with invite code
   * @param {string} inviteCode - Family invite code
   * @returns {Promise} API response
   */
  joinFamily: async (inviteCode) => {
    const response = await api.post("/api/auth/join-family", { inviteCode });
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} API response
   */
  requestPasswordReset: async (email) => {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Verify reset code
   * @param {object} data - Email and token data
   * @returns {Promise} API response
   */
  verifyResetCode: async (data) => {
    const { email, token } = data;
    const response = await api.post("/api/auth/verify-reset-code", {
      email,
      token,
    });
    return response.data;
  },

  /**
   * Reset password
   * @param {object} passwordData - Password reset data
   * @returns {Promise} API response
   */
  resetPassword: async (passwordData) => {
    const response = await api.post("/api/auth/reset-password", passwordData);
    return response.data;
  },
};
