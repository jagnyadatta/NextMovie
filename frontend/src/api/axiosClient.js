import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nextmovie_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Parse Backend ApiResponse and Handle Auth Errors
axiosClient.interceptors.response.use(
  (response) => {
    // Backend returns ApiResponse<T> = { success, status, message, data, timestamp }
    return response.data;
  },
  (error) => {
    const errorResponse = error.response?.data;
    const message =
      errorResponse?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    if (error.response?.status === 401) {
      // If token expired or unauthorized on protected routes
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // localStorage.removeItem('nextmovie_token');
        // localStorage.removeItem('nextmovie_user');
      }
    }

    // Attach extracted message to error object for easy consumption in components
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = errorResponse;
    return Promise.reject(customError);
  }
);

export default axiosClient;
