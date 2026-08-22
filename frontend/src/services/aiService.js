import api from './api';
import {
  localFishRecommendations,
  localPlantRecommendations,
} from '../data/aiCatalog';

function isBackendUnreachable(err) {
  if (!err) return false;
  if (!err.status || err.status >= 502) return true;
  return /cannot reach server/i.test(err.message || '');
}

async function withOfflineFallback(request, fallback) {
  try {
    return await request();
  } catch (err) {
    if (isBackendUnreachable(err)) {
      return fallback();
    }
    throw err;
  }
}

export const aiService = {
  getSpecies: (tankId) => api.get(`/ai/tanks/${tankId}/species`),
  getPredictions: (tankId) => api.get(`/ai/tanks/${tankId}/predictions`),
  getPlants: (tankId) => api.get(`/ai/tanks/${tankId}/plants`),
  analyzeFish: (body) => withOfflineFallback(
    () => api.post('/ai/analyze/fish', body),
    () => ({
      recommendations: localFishRecommendations(body.tankType || 'Community', body),
      warning: Number(body.ammonia) > 0.05 || Number(body.temperature) > 30
        ? 'Water parameters are unsafe — fix ammonia and temperature first'
        : null,
      source: 'expert',
      message: 'Backend offline — expert recommendations from your inputs. Start F5 → Aqua Mind (Full Stack).',
    })
  ),
  analyzeWater: (body) => api.post('/ai/analyze/water', body),
  analyzePlants: (body) => withOfflineFallback(
    () => api.post('/ai/analyze/plants', body),
    () => ({
      plants: localPlantRecommendations(body),
      source: 'expert',
      message: Number(body.temperature) > 30
        ? 'Backend offline — high temperature hurts most plants. Cool the tank below 30°C. Start F5 → Aqua Mind (Full Stack) for full ML.'
        : 'Backend offline — expert plant picks from your inputs. Start F5 → Aqua Mind (Full Stack).',
    })
  ),
};
