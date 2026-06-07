function StatCard({ variant, icon, value, label, change, changeType, valueColor }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className={`stat-icon ${variant}`}>{icon}</div>
      <div className="stat-value" style={{ color: valueColor }}>{value}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-change ${changeType}`}>{change}</div>
    </div>
  );
}

export default StatCard;
