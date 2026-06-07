const tankModel = require('../models/tankModel');
const waterModel = require('../models/waterModel');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5001';

async function fetchAI(path) {
  try {
    const res = await fetch(`${AI_ENGINE_URL}${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getSpeciesAdvice(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const latest = await waterModel.getLatestByTank(req.params.tankId);
  const aiData = await fetchAI(`/api/species?tankType=${tank.TankType || ''}`);

  res.json({
    tank: {
      name: tank.Name,
      volumeLiters: tank.VolumeLiters,
      tankType: tank.TankType,
      pH: latest?.pH,
      temperature: latest?.Temperature,
    },
    recommendations: aiData?.recommendations || [],
    warning: aiData?.warning || null,
    message: aiData ? null : 'AI engine offline — start the Python service on port 5001',
  });
}

async function getPredictions(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const history = await waterModel.getHistoryByTank(req.params.tankId, 30);
  const aiData = await fetchAI(`/api/predict?tankId=${req.params.tankId}`);

  if (aiData?.predictions) {
    return res.json({ predictions: aiData.predictions, source: 'ai-engine' });
  }

  const predictions = [];
  if (history.length < 3) {
    return res.json({
      predictions: [],
      message: 'Log at least 3 water readings to enable predictions',
    });
  }

  const latest = history[0];
  if (latest.Ammonia > 0.01) {
    predictions.push({
      icon: '📈', title: 'Ammonia may rise', variant: 'warn',
      sub: 'Recent readings show elevated ammonia — schedule a water change',
    });
  }
  if (latest.Temperature > 27) {
    predictions.push({
      icon: '🌡️', title: 'Temperature trending up', variant: 'info',
      sub: 'Check heater settings to maintain stable temperature',
    });
  }
  if (latest.pH >= 6.8 && latest.pH <= 7.5) {
    predictions.push({
      icon: '✅', title: 'pH looks stable', variant: 'success',
      sub: 'Current pH is within the ideal range',
    });
  }

  res.json({ predictions, source: 'rule-based' });
}

async function getPlantAdvice(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const aiData = await fetchAI(`/api/plants?tankType=${tank.TankType || ''}`);

  res.json({
    plants: aiData?.plants || [],
    message: aiData ? null : 'AI engine offline — plant suggestions unavailable',
  });
}

module.exports = { getSpeciesAdvice, getPredictions, getPlantAdvice };
