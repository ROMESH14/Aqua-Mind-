import api from './api';

export const equipmentService = {
  getAll: (tankId) => api.get(`/equipment${tankId ? `?tankId=${tankId}` : ''}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  remove: (id) => api.delete(`/equipment/${id}`),
};
