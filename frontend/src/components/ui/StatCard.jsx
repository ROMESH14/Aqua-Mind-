function displayValue(value) {
  if (value == null || value === '' || value === 'undefined' || value === 'null') return '—';
  return value;
}

function StatCard({ variant, icon, value, label, change, changeType, valueColor }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-orb" aria-hidden />
      <div className={`stat-icon ${variant}`}>{icon}</div>
      <div className="stat-value" style={{ color: valueColor }}>{displayValue(value)}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-change ${changeType}`}>{displayValue(change)}</div>
    </div>
  );
}

export default StatCard;
