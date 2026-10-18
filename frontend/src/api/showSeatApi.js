import axiosClient from './axiosClient';

export const showSeatApi = {
  getByShow: (showUuid, page = 0, size = 200) =>
    axiosClient.get(`/show-seats/show/${showUuid}`, { params: { page, size } }),

  getAvailable: (showUuid, page = 0, size = 200) =>
    axiosClient.get(`/show-seats/show/${showUuid}/available`, {
      params: { page, size },
    }),

  getByUuid: (showSeatUuid) => axiosClient.get(`/show-seats/${showSeatUuid}`),

  updatePrice: (showSeatUuid, price) =>
    axiosClient.put(`/show-seats/${showSeatUuid}/price`, { price }),

  updateStatus: (showSeatUuid, status) =>
    axiosClient.patch(`/show-seats/${showSeatUuid}/status`, null, {
      params: { status },
    }),
};

export default showSeatApi;
