const tankModel = require('../models/tankModel');
const waterModel = require('../models/waterModel');
const alertModel = require('../models/alertModel');
const {
  enrichFishList,
  enrichPlantList,
  localFishRecommendations,
  localPlantRecommendations,
  detailedWaterPredictions,
} = require('../data/aiCatalog');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5001';

async function postAI(path, body) {
  try {
    const res = await fetch(`${AI_ENGINE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, status: res.status, data };
    }
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, data: null };
  }
}

async function fetchAI(path) {
  try {
    const res = await fetch(`${AI_ENGINE_URL}${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function mapReadingsForAI(history) {
  return history.map((r) => ({
    ReadingID: r.ReadingID,
    TankID: r.TankID,
    pH: r.pH,
    Temperature: r.Temperature,
    Ammonia: r.Ammonia,
    Nitrite: r.Nitrite,
    Nitrate: r.Nitrate,
    DissolvedO2: r.DissolvedO2,
    RecordedAt: r.RecordedAt,
  }));
}

async function createRiskAlerts(userId, tankId, tankName, riskFlags) {
  if (!riskFlags?.length) return;

  const recent = await alertModel.getByUser(userId, 50);
  const tankIdNum = parseInt(tankId, 10);

  for (const flag of riskFlags) {
    if (!flag.severity || !['alert', 'warn'].includes(flag.severity)) continue;

    const title = flag.message || `${flag.param} risk`;
    const duplicate = recent.some(
      (a) => a.TankID === tankIdNum && a.Title === title
    );
    if (duplicate) continue;

    await alertModel.create(userId, {
      tankId: tankIdNum,
      alertType: flag.severity,
      title,
      detail: `AI forecast for ${tankName}`,
    });
  }
}

function ruleBasedPredictions(history) {
  const predictions = [];
  if (history.length < 3) {
    return {
      predictions: [],
      message: 'Log at least 3 water readings to enable predictions',
    };
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

  return { predictions, source: 'rule-based' };
}

async function getSpeciesAdvice(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const latest = await waterModel.getLatestByTank(req.params.tankId);
  const aiResult = await postAI('/recommend/fish', {
    volumeLiters: tank.VolumeLiters,
    tankType: tank.TankType || 'Community',
    ph: latest?.pH,
    temperature: latest?.Temperature,
    ammonia: latest?.Ammonia,
    nitrite: latest?.Nitrite,
    nitrate: latest?.Nitrate,
  });

  const aiData = aiResult.ok ? aiResult.data : null;

  if (!aiData) {
    const fallback = await fetchAI(`/api/species?tankType=${encodeURIComponent(tank.TankType || 'Community')}`);
    return res.json({
      tank: {
        name: tank.Name,
        volumeLiters: tank.VolumeLiters,
        tankType: tank.TankType,
        pH: latest?.pH,
        temperature: latest?.Temperature,
      },
      recommendations: fallback?.recommendations || [],
      warning: fallback?.warning || null,
      message: 'AI engine offline — start the Python service on port 5001',
    });
  }

  res.json({
    tank: {
      name: tank.Name,
      volumeLiters: tank.VolumeLiters,
      tankType: tank.TankType,
      pH: latest?.pH,
      temperature: latest?.Temperature,
    },
    recommendations: aiData.recommendations || [],
    warning: aiData.warning || null,
    source: aiData.source || 'ai-engine',
    message: aiData.message || null,
  });
}

async function getPredictions(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const history = await waterModel.getHistoryByTank(req.params.tankId, 30);

  if (history.length < 3) {
    return res.json({
      predictions: [],
      message: 'Log at least 3 water readings to enable predictions',
    });
  }

  const aiResult = await postAI('/predict/water-quality', {
    readings: mapReadingsForAI(history.slice().reverse()),
  });

  if (aiResult.ok && aiResult.data?.predictions?.length) {
    await createRiskAlerts(
      req.user.id,
      req.params.tankId,
      tank.Name,
      aiResult.data.riskFlags
    );
    return res.json({
      predictions: aiResult.data.predictions,
      forecasts: aiResult.data.forecasts,
      source: aiResult.data.source || 'ai-engine',
      message: aiResult.data.message || null,
    });
  }

  if (aiResult.data?.message) {
    const fallback = ruleBasedPredictions(history);
    return res.json({
      ...fallback,
      message: `${aiResult.data.message} — using rule-based fallback`,
    });
  }

  const fallback = ruleBasedPredictions(history);
  if (fallback.predictions.length) {
    return res.json({
      ...fallback,
      message: fallback.message || 'AI engine offline — using rule-based predictions',
    });
  }

  res.json(fallback);
}

async function getPlantAdvice(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const latest = await waterModel.getLatestByTank(req.params.tankId);
  const lightingMap = { Planted: 'high', Community: 'medium' };
  const co2Map = { Planted: 'medium', Community: 'none' };
  const tankType = tank.TankType || 'Community';

  const aiResult = await postAI('/recommend/plants', {
    tankType,
    lighting: lightingMap[tankType] || 'low',
    co2: co2Map[tankType] || 'none',
    ph: latest?.pH,
    temperature: latest?.Temperature,
  });

  const aiData = aiResult.ok ? aiResult.data : null;

  if (!aiData) {
    const fallback = await fetchAI(`/api/plants?tankType=${encodeURIComponent(tankType)}`);
    return res.json({
      plants: fallback?.plants || [],
      message: 'AI engine offline — plant suggestions unavailable',
    });
  }

  res.json({
    plants: aiData.plants || [],
    source: aiData.source || 'ai-engine',
    message: aiData.message || null,
  });
}

async function analyzeFish(req, res) {
  const { volumeLiters, tankType, ph, temperature, ammonia, nitrite, nitrate } = req.body;

  const aiResult = await postAI('/recommend/fish', {
    volumeLiters: volumeLiters ? Number(volumeLiters) : 60,
    tankType: tankType || 'Community',
    ph: ph != null && ph !== '' ? Number(ph) : 7.0,
    temperature: temperature != null && temperature !== '' ? Number(temperature) : 25,
    ammonia: ammonia != null && ammonia !== '' ? Number(ammonia) : 0,
    nitrite: nitrite != null && nitrite !== '' ? Number(nitrite) : 0,
    nitrate: nitrate != null && nitrate !== '' ? Number(nitrate) : 0,
  });

  const aiData = aiResult.ok ? aiResult.data : null;
  if (!aiData) {
    const fallback = await fetchAI(`/api/species?tankType=${encodeURIComponent(tankType || 'Community')}`);
    const recs = fallback?.recommendations?.length
      ? enrichFishList(fallback.recommendations)
      : localFishRecommendations(tankType || 'Community', req.body);
    return res.json({
      recommendations: recs,
      warning: fallback?.warning || (Number(ammonia) > 0.05 ? 'Water parameters are unsafe for fish — fix ammonia and temperature first' : null),
      source: fallback?.recommendations?.length ? 'catalog' : 'expert',
      message: fallback ? 'AI engine offline — using catalog defaults' : 'Expert recommendations based on your inputs',
    });
  }

  res.json({
    recommendations: enrichFishList(
      aiData.recommendations?.length
        ? aiData.recommendations
        : localFishRecommendations(tankType || 'Community', req.body)
    ),
    warning: aiData.warning || null,
    source: aiData.source || 'ml',
    message: aiData.message || null,
  });
}

async function analyzeWater(req, res) {
  const { readings, tankId } = req.body;

  if (!readings?.length || readings.length < 3) {
    return res.status(400).json({ message: 'Enter at least 3 water readings' });
  }

  const normalized = readings.map((r) => ({
    pH: r.pH != null && r.pH !== '' ? Number(r.pH) : null,
    Temperature: r.temperature != null && r.temperature !== '' ? Number(r.temperature) : null,
    Ammonia: r.ammonia != null && r.ammonia !== '' ? Number(r.ammonia) : null,
    Nitrite: r.nitrite != null && r.nitrite !== '' ? Number(r.nitrite) : 0,
    Nitrate: r.nitrate != null && r.nitrate !== '' ? Number(r.nitrate) : 0,
    DissolvedO2: r.dissolvedO2 != null && r.dissolvedO2 !== '' ? Number(r.dissolvedO2) : 7,
    RecordedAt: r.recordedAt || new Date().toISOString(),
  }));

  const aiResult = await postAI('/predict/water-quality', { readings: normalized });

  if (aiResult.ok && aiResult.data?.predictions?.length) {
    if (tankId) {
      const tank = await tankModel.findById(tankId, req.user.id);
      if (tank) {
        await createRiskAlerts(req.user.id, tankId, tank.Name, aiResult.data.riskFlags);
      }
    }
    const detailed = detailedWaterPredictions(normalized);
    const merged = aiResult.data.predictions.map((p, i) => ({
      ...p,
      detail: detailed.predictions[i]?.detail || p.sub,
      image: detailed.predictions[i]?.image || '/deck-tank.png',
    }));
    return res.json({
      predictions: merged.length ? merged : detailed.predictions,
      forecasts: aiResult.data.forecasts || detailed.forecasts,
      source: aiResult.data.source || 'ml',
      message: aiResult.data.message || null,
    });
  }

  const history = normalized.map((r) => ({
    pH: r.pH,
    Temperature: r.Temperature,
    Ammonia: r.Ammonia,
  })).reverse();

  const detailed = detailedWaterPredictions(normalized);

  if (aiResult.data?.message) {
    return res.json({
      predictions: detailed.predictions,
      forecasts: detailed.forecasts,
      message: `${aiResult.data.message} — showing expert analysis from your readings`,
      source: 'expert',
    });
  }

  const fallback = ruleBasedPredictions(history);
  if (fallback.predictions.length) {
    const enriched = detailedWaterPredictions(normalized);
    return res.json({
      predictions: enriched.predictions,
      forecasts: enriched.forecasts,
      source: 'expert',
      message: 'Expert analysis from your entered readings',
    });
  }

  res.json({
    ...detailed,
    source: 'expert',
    message: 'Analysis based on your entered readings',
  });
}

async function analyzePlants(req, res) {
  const { tankType, lighting, co2, ph, temperature } = req.body;

  const aiResult = await postAI('/recommend/plants', {
    tankType: tankType || 'Planted',
    lighting: lighting || 'medium',
    co2: co2 || 'none',
    ph: ph != null && ph !== '' ? Number(ph) : 7.0,
    temperature: temperature != null && temperature !== '' ? Number(temperature) : 25,
  });

  const aiData = aiResult.ok ? aiResult.data : null;
  if (!aiData) {
    const fallback = await fetchAI(`/api/plants?tankType=${encodeURIComponent(tankType || 'Planted')}`);
    const plants = fallback?.plants?.length
      ? enrichPlantList(fallback.plants)
      : localPlantRecommendations(req.body);
    return res.json({
      plants,
      source: fallback?.plants?.length ? 'catalog' : 'expert',
      message: fallback ? 'AI engine offline — using catalog defaults' : 'Expert plant picks for your setup',
    });
  }

  res.json({
    plants: enrichPlantList(
      aiData.plants?.length
        ? aiData.plants
        : localPlantRecommendations(req.body)
    ),
    source: aiData.source || 'ml',
    message: aiData.message || null,
  });
}

module.exports = {
  getSpeciesAdvice,
  getPredictions,
  getPlantAdvice,
  analyzeFish,
  analyzeWater,
  analyzePlants,
};
