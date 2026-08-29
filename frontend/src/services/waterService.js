import api from './api';

export const waterService = {
  getLatest: (tankId) => api.get(`/water/tanks/${tankId}/latest`),
  getHistory: (tankId) => api.get(`/water/tanks/${tankId}/history`),
  getAssessment: (tankId) => api.get(`/water/tanks/${tankId}/assessment`),
  getModel: () => api.get('/water/model'),
  scanReading: (tankId, image) => api.post(`/water/tanks/${tankId}/scan`, { image }),
  scanThermometer: (tankId, image) => api.post(`/water/tanks/${tankId}/scan-thermometer`, { image }),
  logReading: (tankId, data) => api.post(`/water/tanks/${tankId}/readings`, data),
};
