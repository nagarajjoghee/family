import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Photo endpoints
export const photoAPI = {
  getAll: (albumId) => api.get('/photos', { params: { albumId } }),
  getById: (id) => api.get(`/photos/${id}`),
  create: (photoData) => api.post('/photos', photoData),
  delete: (id) => api.delete(`/photos/${id}`),
};

// Album endpoints
export const albumAPI = {
  getAll: () => api.get('/albums'),
  getById: (id) => api.get(`/albums/${id}`),
  create: (albumData) => api.post('/albums', albumData),
  update: (id, albumData) => api.put(`/albums/${id}`, albumData),
  delete: (id) => api.delete(`/albums/${id}`),
};

// Comment endpoints
export const commentAPI = {
  getByPhotoId: (photoId) => api.get(`/comments/${photoId}`),
  create: (commentData) => api.post('/comments', commentData),
  delete: (id) => api.delete(`/comments/${id}`),
};

export default api;

