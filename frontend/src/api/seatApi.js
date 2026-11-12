import axiosClient from './axiosClient';

export const seatApi = {
  getByScreen: (screenUuid, page = 0, size = 500) =>
    axiosClient.get(`/seats/screen/${screenUuid}`, { params: { page, size } }),

  getByUuid: (seatUuid) => axiosClient.get(`/seats/byid/${seatUuid}`),

  create: (seatData) => axiosClient.post('/seats', seatData),

  bulkGenerate: (data) => axiosClient.post('/seats/bulk-generate', data),

  update: (seatUuid, seatData) => axiosClient.put(`/seats/${seatUuid}`, seatData),

  updateStatus: (seatUuid, active) =>
    axiosClient.patch(`/seats/${seatUuid}/status`, null, { params: { active } }),

  delete: (seatUuid) => axiosClient.delete(`/seats/${seatUuid}`),
};

export default seatApi;
