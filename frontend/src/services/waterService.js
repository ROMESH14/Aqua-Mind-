import api from './api';

export const waterService = {
  getLatest: (tankId) => api.get(`/water/tanks/${tankId}/latest`),
  getHistory: (tankId) => api.get(`/water/tanks/${tankId}/history`),
  logReading: (tankId, data) => api.post(`/water/tanks/${tankId}/readings`, data),
};
