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
      // Server responded with error status
      console.error("API Error:", error.response.data);
      if (error.response.data.message) {
        console.error("Detailed message:", error.response.data.message);
      }

      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          window.location.href = "/sign-in";
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
