import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject({ message: "Network error" });
    }

    // ✅ IMPORTANT: ignore /auth/me failure
    if (
      error.response.status === 401 &&
      originalRequest.url.includes("/auth/me")
    ) {
      return Promise.reject(error);
    }

    // ✅ Handle other 401 (real unauthorized)
    if (error.response.status === 401) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;