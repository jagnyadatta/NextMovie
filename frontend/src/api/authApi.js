import axiosClient from './axiosClient';

export const authApi = {
  signup: (userData) => axiosClient.post('/auth/signup', userData),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
};

export default authApi;
