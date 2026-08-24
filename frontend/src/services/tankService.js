import api from './api';

export const tankService = {
  getAll: () => api.get('/tanks'),
  create: (data) => api.post('/tanks', data),
  remove: (id) => api.delete(`/tanks/${id}`),
};
