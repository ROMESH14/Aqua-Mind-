import api from './api';

export const growthService = {
  getAll: (tankId) => api.get(`/growth${tankId ? `?tankId=${tankId}` : ''}`),
  create: (data) => api.post('/growth', data),
  remove: (id) => api.delete(`/growth/${id}`),
};
