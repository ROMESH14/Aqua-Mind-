function num(reading, ...keys) {
  for (const key of keys) {
    if (reading?.[key] == null || reading[key] === '') continue;
    const value = Number(reading[key]);
    if (!Number.isNaN(value)) return value;
  }
  return null;
}

const PARAM_SPECS = [
  { key: 'Ammonia', keys: ['Ammonia', 'ammonia'], label: 'Ammonia', unit: 'ppm', digits: 3, max: 0.01, alertMax: 0.05 },
  { key: 'Nitrite', keys: ['Nitrite', 'nitrite'], label: 'Nitrite', unit: 'ppm', digits: 3, max: 0.01, alertMax: 0.25 },
  { key: 'Nitrate', keys: ['Nitrate', 'nitrate'], label: 'Nitrate', unit: 'ppm', digits: 1, max: 20 },
  { key: 'pH', keys: ['pH', 'ph', 'PH'], label: 'pH', unit: '', digits: 2, min: 6.5, max: 7.8 },
  { key: 'Temperature', keys: ['Temperature', 'temperature'], label: 'Temperature', unit: '°C', digits: 1, min: 22, max: 30 },
  { key: 'DissolvedO2', keys: ['DissolvedO2', 'dissolvedO2', 'dissolvedo2'], label: 'Dissolved O₂', unit: 'mg/L', digits: 1, min: 6, alertMin: 4 },
];

function formatParamValue(spec, value) {
  const shown = value.toFixed(spec.digits);
  if (spec.unit === '°C') return `${shown}°C`;
  if (spec.unit) return `${shown} ${spec.unit}`;
  return shown;
}

function buildParamAlerts(reading = {}, tankName = '') {
  const where = tankName ? ` in ${tankName}` : '';
  const alerts = [];

  for (const spec of PARAM_SPECS) {
    const value = num(reading, ...spec.keys);
    if (value == null) continue;

    let direction = null;
    let alertType = 'warn';
    if (spec.min != null && value < spec.min) {
      direction = 'LOW';
      if (spec.alertMin != null && value < spec.alertMin) alertType = 'alert';
    } else if (spec.max != null && value > spec.max) {
      direction = 'HIGH';
      if (spec.alertMax != null && value > spec.alertMax) alertType = 'alert';
    }
    if (!direction) continue;

    alerts.push({
      key: spec.key,
      direction,
      alertType,
      title: `${spec.label} ${direction}`,
      detail: `${formatParamValue(spec, value)}${where}`,
    });
  }

  return alerts;
}

function evaluateReading(reading = {}) {
  const alerts = buildParamAlerts(reading);
  let status = 'ok';
  for (const item of alerts) {
    if (item.alertType === 'alert') status = 'alert';
    else if (status !== 'alert') status = 'warn';
  }
  const issues = alerts.map((item) => item.title);

  return {
    status,
    statusText: issues.length ? issues.join(', ') : 'All parameters optimal',
    issues,
    alerts,
  };
}

function fallbackAssessment(reading, tankName) {
  const evaluation = evaluateReading(reading || {});
  const label = evaluation.status === 'ok' ? 'excellent' : evaluation.status === 'alert' ? 'critical' : 'watch';
  const actions = [];
  if (reading?.Ammonia > 0.01) {
    actions.push({
      title: 'Cut ammonia now',
      detail: 'Do a 40–50% water change with dechlorinated water. Pause feeding for 24 hours and add beneficial bacteria.',
      priority: reading.Ammonia > 0.05 ? 'critical' : 'high',
      param: 'Ammonia',
    });
  }
  if (reading?.Nitrite > 0.01) {
    actions.push({
      title: 'Treat a nitrite spike',
      detail: 'Change 40% of the water and add a nitrite detoxifier. Do not replace all filter media at once.',
      priority: 'critical',
      param: 'Nitrite',
    });
  }
  if (reading?.Nitrate > 20) {
    actions.push({
      title: 'Lower nitrate',
      detail: 'Do a 25–40% water change, vacuum the substrate, and add fast-growing plants.',
      priority: 'medium',
      param: 'Nitrate',
    });
  }
  if (reading?.pH != null && (reading.pH < 6.5 || reading.pH > 7.8)) {
    actions.push({
      title: reading.pH < 6.5 ? 'Raise pH slowly' : 'Bring pH down gently',
      detail: 'Correct pH with small water changes only. Move no more than 0.2 per day.',
      priority: 'high',
      param: 'pH',
    });
  }
  if (reading?.Temperature != null && (reading.Temperature < 22 || reading.Temperature > 30)) {
    actions.push({
      title: reading.Temperature < 22 ? 'Warm the tank' : 'Cool the water',
      detail: 'Adjust the heater 1°C at a time and increase surface movement if the tank is hot.',
      priority: 'high',
      param: 'Temperature',
    });
  }
  if (reading?.DissolvedO2 != null && reading.DissolvedO2 < 6) {
    actions.push({
      title: 'Boost oxygen',
      detail: 'Aim the filter at the surface or add an air stone. Fish gasping means act now.',
      priority: 'high',
      param: 'DissolvedO2',
    });
  }
  if (!actions.length) {
    actions.push({
      title: 'Keep the routine',
      detail: 'Parameters look safe. Keep weekly testing and regular water changes.',
      priority: 'low',
      param: 'all',
    });
  }

  const where = tankName ? ` in ${tankName}` : '';
  return {
    status: label,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    score: label === 'excellent' ? 92 : label === 'watch' ? 62 : 28,
    confidence: 0.7,
    summary: evaluation.status === 'ok'
      ? `Water looks excellent${where}. Logged parameters are inside the default safe range.`
      : `Water quality needs attention${where}. ${evaluation.statusText}.`,
    issues: evaluation.issues.map((message) => ({ param: message, value: null, ideal: '', severity: label })),
    actions,
    species: [],
    unmatched: [],
    ranges: {
      ph_min: 6.5, ph_max: 7.8, temp_min: 22, temp_max: 28,
      max_ammonia: 0.02, max_nitrite: 0.02, max_nitrate: 20, min_do: 6,
    },
    reading: {
      pH: reading?.pH ?? null,
      Temperature: reading?.Temperature ?? null,
      Ammonia: reading?.Ammonia ?? null,
      Nitrite: reading?.Nitrite ?? null,
      Nitrate: reading?.Nitrate ?? null,
      DissolvedO2: reading?.DissolvedO2 ?? null,
    },
    source: 'rules',
    model: { ready: false, rounds: [] },
  };
}

function paramColor(status) {
  if (status === 'good' || status === 'ok') return 'var(--success)';
  if (status === 'warn') return 'var(--warn)';
  return 'var(--red-light)';
}

function evaluateParam(label, value) {
  const rules = {
    pH: { min: 6.5, max: 7.8, ideal: '6.8–7.5' },
    Temperature: { min: 22, max: 30, ideal: '24–28°C', unit: '°C' },
    Ammonia: { max: 0.01, ideal: '<0.01', unit: 'ppm' },
    Nitrite: { max: 0.01, ideal: '0', unit: 'ppm' },
    Nitrate: { max: 20, ideal: '<20', unit: 'ppm' },
    DissolvedO2: { min: 6, ideal: '>6', unit: 'mg/L' },
  };

  const rule = rules[label];
  if (!rule || value == null) return { status: 'good', color: 'var(--success)' };

  let status = 'good';
  if (rule.min != null && value < rule.min) status = 'warn';
  if (rule.max != null && value > rule.max) status = 'warn';
  if (label === 'Ammonia' && value > 0.05) status = 'bad';

  return { status, color: paramColor(status === 'good' ? 'good' : status) };
}

module.exports = { evaluateReading, evaluateParam, fallbackAssessment, buildParamAlerts };
