import api from './api';

export const tankService = {
  getAll: () => api.get('/tanks'),
  getOne: (id) => api.get(`/tanks/${id}`),
  create: (data) => api.post('/tanks', data),
  update: (id, data) => api.put(`/tanks/${id}`, data),
  delete: (id) => api.delete(`/tanks/${id}`),
};
