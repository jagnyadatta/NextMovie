import axiosClient from './axiosClient';

export const showApi = {
  getShows: (date, page = 0, size = 20) =>
    axiosClient.get('/shows', { params: { date, page, size } }),

  getByMovie: (movieUuid, date, page = 0, size = 20) =>
    axiosClient.get(`/shows/movie/${movieUuid}`, { params: { date, page, size } }),

  getByTheatre: (theatreUuid, date, page = 0, size = 20) =>
    axiosClient.get(`/shows/theatre/${theatreUuid}`, { params: { date, page, size } }),

  getByCity: (city, date, page = 0, size = 20) =>
    axiosClient.get(`/shows/city/${encodeURIComponent(city)}`, {
      params: { date, page, size },
    }),

  getByUuid: (showUuid) => axiosClient.get(`/shows/${showUuid}`),

  getShowSeats: (showUuid, page = 0, size = 200) =>
    axiosClient.get(`/shows/${showUuid}/seats`, { params: { page, size } }),

  getAvailableSeats: (showUuid, page = 0, size = 200) =>
    axiosClient.get(`/shows/${showUuid}/available-seats`, {
      params: { page, size },
    }),

  create: (showData) => axiosClient.post('/shows', showData),

  update: (showUuid, showData) =>
    axiosClient.put(`/shows/${showUuid}`, showData),

  updateStatus: (showUuid, status) =>
    axiosClient.patch(`/shows/${showUuid}/status`, null, {
      params: { status },
    }),

  delete: (showUuid) => axiosClient.delete(`/shows/${showUuid}`),
};

export default showApi;
