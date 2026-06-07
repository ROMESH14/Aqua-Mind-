function EmptyState({ icon = '📭', title, message, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      {title && <div className="empty-state-title">{title}</div>}
      {message && <div className="empty-state-message">{message}</div>}
      {children}
    </div>
  );
}

export default EmptyState;
