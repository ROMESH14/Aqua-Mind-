import api from './api';

export const aiService = {
  getSpecies: (tankId) => api.get(`/ai/tanks/${tankId}/species`),
  getPredictions: (tankId) => api.get(`/ai/tanks/${tankId}/predictions`),
  getPlants: (tankId) => api.get(`/ai/tanks/${tankId}/plants`),
};
