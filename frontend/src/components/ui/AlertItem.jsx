function AlertItem({ type, icon, title, detail, time }) {
  return (
    <div className={`alert-item ${type}`}>
      <div className="alert-icon">{icon}</div>
      <div>
        <div className="alert-text">
          <strong>{title}</strong> {detail}
        </div>
        <div className="alert-time">{time}</div>
      </div>
    </div>
  );
}

export default AlertItem;
