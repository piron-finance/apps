import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth provider
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const url = error.config?.url || "";
      const status = error.response.status;

      // Silently pass through 404s on user position/profile routes
      // These are expected when a user hasn't deposited yet
      const isSilent404 =
        status === 404 &&
        (url.includes("/users/") && (url.includes("/positions") || url.includes("/locked-positions")));

      if (!isSilent404) {
        // Server responded with error status
        console.error("API Error:", {
          url,
          method: error.config?.method,
          status,
          data: error.response.data,
        });
        if (error.response.data?.message) {
          console.error("Detailed message:", error.response.data.message);
        }
      }

      // Handle 401 Unauthorized
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          // User needs to reconnect wallet
          console.warn("Unauthorized - please reconnect your wallet");
        }
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.request);
    } else {
      // Error in request setup
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);
