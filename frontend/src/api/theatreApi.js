import axiosClient from './axiosClient';

export const theatreApi = {
  getAll: (page = 0, size = 20) =>
    axiosClient.get('/theatres', { params: { page, size } }),

  getByCity: (city, page = 0, size = 20) =>
    axiosClient.get(`/theatres/city/${encodeURIComponent(city)}`, {
      params: { page, size },
    }),

  getByUuid: (theatreUuid) => axiosClient.get(`/theatres/${theatreUuid}`),

  getScreens: (theatreUuid, page = 0, size = 50) =>
    axiosClient.get(`/theatres/${theatreUuid}/screens`, {
      params: { page, size },
    }),

  create: (theatreData) => axiosClient.post('/theatres', theatreData),

  update: (theatreUuid, theatreData) =>
    axiosClient.put(`/theatres/${theatreUuid}`, theatreData),

  updateStatus: (theatreUuid, active) =>
    axiosClient.patch(`/theatres/${theatreUuid}/status`, null, {
      params: { active },
    }),

  delete: (theatreUuid) => axiosClient.delete(`/theatres/${theatreUuid}`),
};

export default theatreApi;
