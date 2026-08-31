const tankModel = require('../models/tankModel');
const waterModel = require('../models/waterModel');
const alertModel = require('../models/alertModel');
const { evaluateReading, evaluateParam, fallbackAssessment, buildParamAlerts } = require('../utils/waterQuality');
const { parseInhabitants } = require('../utils/tankInhabitants');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5001';

const PARAM_LABELS = [
  { key: 'pH', label: 'pH Level', suffix: '' },
  { key: 'Temperature', label: 'Temperature', suffix: '°' },
  { key: 'Ammonia', label: 'Ammonia (NH₃)', suffix: '' },
  { key: 'Nitrite', label: 'Nitrite (NO₂)', suffix: '' },
  { key: 'Nitrate', label: 'Nitrate (NO₃)', suffix: '' },
  { key: 'DissolvedO2', label: 'Dissolved O₂', suffix: '' },
];

const DEFAULT_UNITS = {
  pH: 'ideal 6.8–7.5',
  Temperature: 'C — ideal 24–28°C',
  Ammonia: 'ppm — ideal <0.01',
  Nitrite: 'ppm — ideal 0',
  Nitrate: 'ppm — ideal <20',
  DissolvedO2: 'mg/L — ideal >6',
};

function unitFromRanges(key, ranges) {
  if (!ranges) return DEFAULT_UNITS[key];
  if (key === 'pH') return `ideal ${Number(ranges.ph_min).toFixed(1)}–${Number(ranges.ph_max).toFixed(1)}`;
  if (key === 'Temperature') return `C — ideal ${Math.round(ranges.temp_min)}–${Math.round(ranges.temp_max)}°C`;
  if (key === 'Ammonia') return `ppm — ideal <${Number(ranges.max_ammonia).toFixed(2)}`;
  if (key === 'Nitrite') return `ppm — ideal <${Number(ranges.max_nitrite).toFixed(2)}`;
  if (key === 'Nitrate') return `ppm — ideal <${Math.round(ranges.max_nitrate)}`;
  if (key === 'DissolvedO2') return `mg/L — ideal >${Math.round(ranges.min_do)}`;
  return DEFAULT_UNITS[key];
}

function issueMatches(item, key) {
  const param = String(item?.param || '');
  return param === key || param.startsWith(`${key} `) || param.toLowerCase().includes(key.toLowerCase());
}

function issueStatus(key, issues) {
  const hit = (issues || []).find((item) => issueMatches(item, key));
  if (!hit) return null;
  const severity = String(hit.severity || '').toLowerCase();
  return ['critical', 'alert', 'bad'].includes(severity) ? 'bad' : 'warn';
}

function worseStatus(base, extra) {
  const rank = { empty: 0, good: 1, ok: 1, warn: 2, bad: 3 };
  if (!extra) return base;
  return (rank[extra] || 0) > (rank[base] || 0) ? extra : base;
}

function formatReading(reading, ranges, issues) {
  if (!reading) return null;

  const evaluation = evaluateReading(reading);
  const parameters = PARAM_LABELS.map(({ key, label, suffix }) => {
    const value = reading[key];
    const ev = evaluateParam(key, value);
    const status = worseStatus(ev.status, issueStatus(key, issues));
    const color = ev.color && status === ev.status
      ? ev.color
      : (status === 'empty' ? 'var(--text-secondary)' : status === 'good' || status === 'ok' ? 'var(--success)' : status === 'warn' ? 'var(--warn)' : 'var(--red-light)');
    let display = '—';
    if (value != null && value !== '') display = suffix === '°' ? `${value}°` : String(value);
    return {
      key,
      label,
      value,
      display,
      unit: unitFromRanges(key, ranges),
      status,
      color,
    };
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
    id: reading.ReadingID ?? reading.readingid ?? reading.readingId,
    date: reading.RecordedAt,
    ph: reading.pH,
    temp: reading.Temperature,
    nh3: reading.Ammonia,
    no2: reading.Nitrite,
    no3: reading.Nitrate,
    o2: reading.DissolvedO2,
    status: evaluation.status === 'ok' ? 'ok' : evaluation.status === 'alert' ? 'alert' : 'warn',
  };
}

async function postAI(path, body) {
  try {
    const res = await fetch(`${AI_ENGINE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, data };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null };
  }
}

function tankSpecies(tank) {
  return {
    fishNames: parseInhabitants(tank.FishNames),
    plantNames: parseInhabitants(tank.PlantNames),
  };
}

async function assessTankReading(tank, reading) {
  if (!reading) return null;
  const species = tankSpecies(tank);
  const aiResult = await postAI('/assess/water-quality', {
    tankName: tank.Name,
    fishNames: species.fishNames,
    plantNames: species.plantNames,
    reading: {
      pH: reading.pH,
      Temperature: reading.Temperature,
      Ammonia: reading.Ammonia,
      Nitrite: reading.Nitrite,
      Nitrate: reading.Nitrate,
      DissolvedO2: reading.DissolvedO2,
    },
  });
  if (aiResult.ok && aiResult.data?.status) return aiResult.data;
  return fallbackAssessment(reading, tank.Name);
}

async function getLatest(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const reading = await waterModel.getLatestByTank(req.params.tankId);
  const assessment = reading ? await assessTankReading(tank, reading) : null;
  res.json({
    ...formatReading(reading, assessment?.ranges, assessment?.issues),
    assessment,
  });
}

async function getHistory(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const history = await waterModel.getHistoryByTank(req.params.tankId);
  res.json(history.map(formatHistoryRow));
}

async function deleteReading(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const deleted = await waterModel.deleteReading(req.params.readingId, req.params.tankId);
  if (!deleted) return res.status(404).json({ message: 'Reading not found' });
  res.json({ message: 'Reading deleted' });
}

async function scanReading(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });
  if (!req.body?.image) return res.status(400).json({ message: 'Choose a test-kit photo to scan' });

  const aiResult = await postAI('/scan/water-test', { image: req.body.image });
  if (!aiResult.ok || !aiResult.data) {
    return res.status(503).json({
      message: aiResult.data?.message || 'Could not scan the image. Start the AI engine on port 5001.',
    });
  }
  const scanned = { ...aiResult.data, temperature: aiResult.data.temperature ?? null };
  res.json(scanned);
}

async function scanThermometer(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });
  if (!req.body?.image) return res.status(400).json({ message: 'Choose a thermometer photo to scan' });

  const aiResult = await postAI('/scan/thermometer', { image: req.body.image });
  if (!aiResult.ok || aiResult.data?.temperature == null) {
    return res.status(503).json({
      message: aiResult.data?.message || 'Could not read the thermometer. Type the number you see into Temp °C.',
    });
  }
  res.json({
    temperature: Number(aiResult.data.temperature),
    note: aiResult.data.note || `Read ${aiResult.data.temperature}°C from the thermometer photo.`,
  });
}

function validateReading(body) {
  const rules = [
    ['pH', 0, 14, 'pH must be between 0 and 14'],
    ['temperature', 5, 42, 'Temperature must be between 5 and 42°C'],
    ['ammonia', 0, 10, 'Ammonia must be 0–10 ppm'],
    ['nitrite', 0, 20, 'Nitrite must be 0–20 ppm'],
    ['nitrate', 0, 300, 'Nitrate must be 0–300 ppm'],
    ['dissolvedO2', 0, 20, 'Dissolved O₂ must be 0–20 mg/L'],
  ];
  let filled = 0;
  for (const [key, min, max, message] of rules) {
    const raw = body?.[key];
    if (raw === '' || raw == null) continue;
    const value = Number(raw);
    if (Number.isNaN(value) || value < min || value > max) return message;
    filled += 1;
  }
  if (filled < 3) return 'Enter at least 3 readings (for example pH, temperature, and ammonia).';
  return null;
}

async function logReading(req, res) {
  const tank = await tankModel.findById(req.params.tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const invalid = validateReading(req.body);
  if (invalid) return res.status(400).json({ message: invalid });

  const reading = await waterModel.createReading(req.params.tankId, req.body);
  const assessment = await assessTankReading(tank, reading);
  const formatted = formatReading(reading, assessment?.ranges, assessment?.issues);
  const evaluation = evaluateReading(reading);
  const mlStatus = String(assessment?.status || '').toLowerCase();
  const mlBad = assessment && !['excellent', 'ok', 'good'].includes(mlStatus);

  const paramAlerts = buildParamAlerts(reading, tank.Name);
  const notifies = [];
  for (const item of paramAlerts) {
    const row = await alertModel.create(req.user.id, {
      tankId: parseInt(req.params.tankId, 10),
      alertType: item.alertType,
      title: item.title,
      detail: item.detail,
    });
    if (row) notifies.push(alertModel.formatNotify(row));
  }

  if (!notifies.length && mlBad) {
    const row = await alertModel.create(req.user.id, {
      tankId: parseInt(req.params.tankId, 10),
      alertType: evaluation.status === 'alert' || mlStatus === 'critical' ? 'alert' : 'warn',
      title: assessment?.actions?.[0]?.title || 'Water needs a check',
      detail: `in ${tank.Name}`,
    });
    if (row) notifies.push(alertModel.formatNotify(row));
  }

  res.status(201).json({
    ...formatted,
    assessment,
    notify: notifies[0] || null,
    notifies,
  });
}

module.exports = {
  getLatest,
  getHistory,
  deleteReading,
  scanReading,
  scanThermometer,
  logReading,
};
