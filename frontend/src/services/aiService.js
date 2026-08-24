import api from './api';
import {
  localFishRecommendations,
  localPlantRecommendations,
  designTank,
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
  analyzeDesign: (body) => withOfflineFallback(
    () => api.post('/ai/analyze/design', body),
    () => designTank(body)
  ),
  analyzePlants: (body) => withOfflineFallback(
    () => api.post('/ai/analyze/plants', body),
    () => ({
      plants: localPlantRecommendations(body),
      design: designTank({ ...body, theme: body.style || body.theme }),
      source: 'expert',
      message: Number(body.temperature) > 30
        ? 'High temperature hurts most plants. Aim below 30°C. Backend offline — showing expert picks from your answers.'
        : 'New-tank plant and layout ideas from your answers.',
    })
  ),
};
