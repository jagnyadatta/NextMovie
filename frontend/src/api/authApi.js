import axiosClient from './axiosClient';

export const authApi = {
  signup: (userData) => axiosClient.post('/auth/signup', userData),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  sendOtp: (data) => axiosClient.post('/auth/send-otp', data),
  verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
  resendOtp: (data) => axiosClient.post('/auth/resend-otp', data),
};

export default authApi;
