function evaluateReading(reading) {
  const issues = [];
  let status = 'ok';

  if (reading.Ammonia != null && reading.Ammonia > 0.01) {
    issues.push('Ammonia elevated');
    status = 'warn';
  }
  if (reading.Ammonia != null && reading.Ammonia > 0.05) {
    status = 'alert';
  }
  if (reading.Nitrate != null && reading.Nitrate > 20) {
    issues.push('Nitrate high');
    status = status === 'alert' ? 'alert' : 'warn';
  }
  if (reading.pH != null && (reading.pH < 6.5 || reading.pH > 7.8)) {
    issues.push('pH out of range');
    status = status === 'alert' ? 'alert' : 'warn';
  }
  if (reading.Temperature != null && (reading.Temperature < 22 || reading.Temperature > 30)) {
    issues.push('Temperature out of range');
    status = status === 'alert' ? 'alert' : 'warn';
  }

  return {
    status,
    statusText: issues.length ? issues.join(', ') : 'All parameters optimal',
    issues,
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

module.exports = { evaluateReading, evaluateParam };
