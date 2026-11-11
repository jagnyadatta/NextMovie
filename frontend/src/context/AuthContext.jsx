import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import { isTokenExpired, clearStoredAuth } from '../utils/authUtils';
import { SESSION_EXPIRED_EVENT, handleSessionExpired } from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronous initialization ensures no flash of logged-in state if token is expired
  const getInitialAuthState = () => {
    try {
      const savedToken = localStorage.getItem('nextmovie_token');
      const savedUserStr = localStorage.getItem('nextmovie_user');

      if (!savedToken || isTokenExpired(savedToken)) {
        if (savedToken) {
          clearStoredAuth();
        }
        return { token: null, user: null };
      }

      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (!savedUser) {
        clearStoredAuth();
        return { token: null, user: null };
      }

      return { token: savedToken, user: savedUser };
    } catch {
      clearStoredAuth();
      return { token: null, user: null };
    }
  };

  const [authState, setAuthState] = useState(getInitialAuthState);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const token = authState.token;
  const user = authState.user;

  const logout = useCallback(() => {
    setAuthState({ token: null, user: null });
    clearStoredAuth();
  }, []);

  // Listen for session expiration events and window focus/visibility changes
  useEffect(() => {
    // 1. Listen for 401 events dispatched by Axios interceptor
    const handleSessionExpiredListener = () => {
      setAuthState({ token: null, user: null });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiredListener);

    // 2. Validate token expiration when user returns to the tab or browser gains focus
    const checkTokenFreshness = () => {
      const currentToken = localStorage.getItem('nextmovie_token');
      if (currentToken && isTokenExpired(currentToken)) {
        logout();
        handleSessionExpired('Your session has expired. Please log in again.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenFreshness();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkTokenFreshness);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiredListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkTokenFreshness);
    };
  }, [logout]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      // response is backend ApiResponse: { success, status, message, data: { token, user } }
      const { token: jwtToken, user: userData } = response.data;

      // Verify received token has valid expiration
      if (isTokenExpired(jwtToken)) {
        throw new Error('Received expired authentication token from server.');
      }

      setAuthState({ token: jwtToken, user: userData });
      localStorage.setItem('nextmovie_token', jwtToken);
      localStorage.setItem('nextmovie_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await authApi.signup(userData);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (data) => {
    return await authApi.sendOtp(data);
  };

  const verifyOtp = async (data) => {
    return await authApi.verifyOtp(data);
  };

  const resendOtp = async (data) => {
    return await authApi.resendOtp(data);
  };

  // True only if token exists, user exists, and token is not expired
  const isAuthenticated = Boolean(token && user && !isTokenExpired(token));
  const isAdmin = user?.role === 'ADMIN';
  const isTheaterAdmin = user?.role === 'THEATER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initializing,
        login,
        signup,
        sendOtp,
        verifyOtp,
        resendOtp,
        logout,
        isAuthenticated,
        isAdmin,
        isTheaterAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
