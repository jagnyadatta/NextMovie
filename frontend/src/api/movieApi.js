import axiosClient from './axiosClient';

export const movieApi = {
  getRecent: (page = 0, size = 10) =>
    axiosClient.get('/movies/recent', { params: { page, size } }),

  getAll: (page = 0, size = 12, sort = 'title,asc') =>
    axiosClient.get('/movies', { params: { page, size, sort } }),

  getByLanguage: (language, page = 0, size = 12) =>
    axiosClient.get(`/movies/language/${encodeURIComponent(language)}`, {
      params: { page, size },
    }),

  search: (title, page = 0, size = 12) =>
    axiosClient.get('/movies/search', { params: { title, page, size } }),

  getByUuid: async (movieUuid) => {
    try {
      // Backend exposes GET /movies/{movieUuid} for ADMIN
      const response = await axiosClient.get(`/movies/${movieUuid}`);
      return response;
    } catch (err) {
      // Fallback for non-admin: find from list of all movies or recent movies
      const allRes = await axiosClient.get('/movies', { params: { page: 0, size: 100 } });
      const found = allRes?.data?.content?.find((m) => m.movieUuid === movieUuid);
      if (found) {
        return { success: true, status: 200, message: 'Found movie', data: found };
      }
      throw err;
    }
  },

  create: (movieData) => axiosClient.post('/movies', movieData),

  importFromOmdb: (imdbId) => axiosClient.post(`/movies/import/${imdbId}`),

  update: (movieUuid, movieData) =>
    axiosClient.put(`/movies/${movieUuid}`, movieData),

  delete: (movieUuid) => axiosClient.delete(`/movies/${movieUuid}`),
};

export default movieApi;
