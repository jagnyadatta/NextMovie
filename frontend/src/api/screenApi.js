import axiosClient from './axiosClient';

export const screenApi = {
  getByTheatre: (theatreUuid, page = 0, size = 50) =>
    axiosClient.get(`/screens/theatre/${theatreUuid}`, { params: { page, size } }),

  getByUuid: (screenUuid) => axiosClient.get(`/screens/byid/${screenUuid}`),

  getSeats: (screenUuid, page = 0, size = 150) =>
    axiosClient.get(`/screens/${screenUuid}/seats`, { params: { page, size } }),

  create: (screenData) => axiosClient.post('/screens', screenData),

  update: (screenUuid, screenData) =>
    axiosClient.put(`/screens/${screenUuid}`, screenData),

  updateStatus: (screenUuid, active) =>
    axiosClient.patch(`/screens/${screenUuid}/status`, null, {
      params: { active },
    }),

  delete: (screenUuid) => axiosClient.delete(`/screens/${screenUuid}`),
};

export default screenApi;
