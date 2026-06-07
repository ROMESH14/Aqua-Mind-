const tankModel = require('../models/tankModel');
const waterModel = require('../models/waterModel');
const alertModel = require('../models/alertModel');
const { evaluateReading, evaluateParam } = require('../utils/waterQuality');

const PARAM_LABELS = [
  { key: 'pH', label: 'pH Level', unit: '— ideal 6.8–7.5' },
  { key: 'Temperature', label: 'Temperature', unit: 'C — ideal 24–28°C', suffix: '°' },
  { key: 'Ammonia', label: 'Ammonia (NH₃)', unit: 'ppm — ideal <0.01' },
  { key: 'Nitrite', label: 'Nitrite (NO₂)', unit: 'ppm — ideal 0' },
  { key: 'Nitrate', label: 'Nitrate (NO₃)', unit: 'ppm — ideal <20' },
  { key: 'DissolvedO2', label: 'Dissolved O₂', unit: 'mg/L — ideal >6' },
];

function formatReading(reading) {
  if (!reading) return null;

  const evaluation = evaluateReading(reading);
  const parameters = PARAM_LABELS.map(({ key, label, unit, suffix }) => {
    const value = reading[key];
    const ev = evaluateParam(key, value);
    let display = '—';
    if (value != null) display = suffix === '°' ? `${value}°` : String(value);
    return { key, label, value, display, unit, status: ev.status, color: ev.color };
  });

  return {
    id: reading.ReadingID,
    tankId: reading.TankID,
    recordedAt: reading.RecordedAt,
    status: evaluation.status,
    statusText: evaluation.statusText,
    parameters,
    raw: {
      pH: reading.pH,
      temperature: reading.Temperature,
      ammonia: reading.Ammonia,
      nitrite: reading.Nitrite,
      nitrate: reading.Nitrate,
      dissolvedO2: reading.DissolvedO2,
    },
  };
}

function formatHistoryRow(reading) {
  const evaluation = evaluateReading(reading);
  return {
    date: reading.RecordedAt,
    ph: reading.pH,
    temp: reading.Temperature,
    nh3: reading.Ammonia,
    no3: reading.Nitrate,
    o2: reading.DissolvedO2,
    status: evaluation.status === 'ok' ? 'ok' : 'warn',
  };
}

async function getLatest(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const reading = await waterModel.getLatestByTank(req.params.tankId);
  res.json(formatReading(reading));
}

async function getHistory(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const history = await waterModel.getHistoryByTank(req.params.tankId);
  res.json(history.map(formatHistoryRow));
}

async function logReading(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const reading = await waterModel.createReading(req.params.tankId, req.body);
  const formatted = formatReading(reading);
  const evaluation = evaluateReading(reading);

  if (evaluation.issues.length > 0) {
    await alertModel.create(req.user.id, {
      tankId: parseInt(req.params.tankId, 10),
      alertType: evaluation.status === 'alert' ? 'alert' : 'warn',
      title: evaluation.issues[0],
      detail: `detected in ${tank.Name}`,
    });
  }

  res.status(201).json(formatted);
}

module.exports = { getLatest, getHistory, logReading, formatReading };
