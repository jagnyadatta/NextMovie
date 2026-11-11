import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { clearStoredAuth, getValidStoredToken } from '../utils/authUtils';
import { toast } from 'react-toastify';

export const SESSION_EXPIRED_EVENT = 'nextmovie:session-expired';

let isHandlingSessionExpiry = false;

/**
 * Centralized session-expiration handler.
 * Clears stored auth, dispatches state synchronization event,
 * displays a single notification, and redirects to login with return path.
 */
export const handleSessionExpired = (
  message = 'Your session has expired. Please log in again.'
) => {
  if (isHandlingSessionExpiry) return;
  isHandlingSessionExpiry = true;

  // 1. Immediately clear stored authentication data
  clearStoredAuth();

  // 2. Dispatch custom event so AuthContext updates state across all components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } })
    );

    // 3. Display single notification (toastId prevents stacking)
    toast.warn(message, {
      toastId: 'nextmovie-session-expired-toast',
      autoClose: 4000,
    });

    // 4. Redirect to login preserving the return destination (if not already on login/register)
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      const fullUrl = currentPath + window.location.search;
      setTimeout(() => {
        window.location.href = `/login?redirect=${encodeURIComponent(fullUrl)}`;
        isHandlingSessionExpiry = false;
      }, 350);
    } else {
      setTimeout(() => {
        isHandlingSessionExpiry = false;
      }, 1000);
    }
  } else {
    isHandlingSessionExpiry = false;
  }
};

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach valid unexpired JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const validToken = getValidStoredToken();
    if (validToken) {
      config.headers.Authorization = `Bearer ${validToken}`;
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
    const response = error.response;
    const errorResponse = response?.data;
    const status = response?.status;
    const config = error.config;

    const message =
      errorResponse?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // Centralized 401 Session Expiration Handling
    if (status === 401 && config) {
      const url = config.url || '';
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/signup') ||
        url.includes('/auth/send-otp') ||
        url.includes('/auth/verify-otp') ||
        url.includes('/auth/resend-otp');

      const hadAuthHeader = Boolean(
        config.headers?.Authorization || config.headers?.authorization
      );

      // Only trigger session expiration for authenticated requests that failed with 401.
      // Do not trigger for login credential failures or public endpoints.
      if (!isAuthEndpoint && hadAuthHeader) {
        handleSessionExpired('Your session has expired. Please log in again.');
      }
    }

    // Attach extracted message and status to error object for consumption in components
    const customError = new Error(message);
    customError.status = status;
    customError.data = errorResponse;
    return Promise.reject(customError);
  }
);

export default axiosClient;
