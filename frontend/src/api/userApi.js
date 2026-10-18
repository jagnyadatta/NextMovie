import axiosClient from './axiosClient';

export const userApi = {
  getAllUsers: () => axiosClient.get('/users'),

  getByUuid: (userUuid) => axiosClient.get(`/users/${userUuid}`),

  updateRole: (userUuid, role) =>
    axiosClient.patch(`/users/${userUuid}/role`, { role }),

  updateStatus: (userUuid, status) =>
    axiosClient.patch(`/users/${userUuid}/status`, { status }),

  deleteUser: (userUuid) => axiosClient.delete(`/users/${userUuid}`),
};

export default userApi;
