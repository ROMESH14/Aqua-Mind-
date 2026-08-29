import api from './api';

export const tankService = {
  getAll: () => api.get('/tanks'),
  create: (data) => api.post('/tanks', data),
  update: (id, data) => api.put(`/tanks/${id}`, data),
  remove: (id) => api.delete(`/tanks/${id}`),
};
