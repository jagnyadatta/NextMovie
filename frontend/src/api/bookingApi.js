import axiosClient from './axiosClient';

export const bookingApi = {
  createBooking: (bookingData) => axiosClient.post('/bookings', bookingData),

  getMyBookings: (page = 0, size = 10) =>
    axiosClient.get('/bookings/my', { params: { page, size } }),

  getMyBooking: (bookingUuid) => axiosClient.get(`/bookings/${bookingUuid}`),

  getAllBookings: (page = 0, size = 20) =>
    axiosClient.get('/bookings', { params: { page, size } }),
};

export default bookingApi;
