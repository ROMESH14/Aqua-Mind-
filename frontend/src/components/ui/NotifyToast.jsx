import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

function NotifyToast() {
  const notify = useNotifications();
  if (!notify?.toast) return null;
  const { toast, dismissToast } = notify;

  return (
    <div className={`notify-toast notify-toast-${toast.type || 'info'}`} role="status">
      <div>
        <em>Message from AquaMind</em>
        <strong>{toast.title}</strong>
        {toast.detail && <p>{toast.detail}</p>}
        <Link to={toast.href || '/dashboard'} className="notify-toast-link" onClick={dismissToast}>
          Open
        </Link>
      </div>
      <button type="button" className="notify-toast-close" onClick={dismissToast} aria-label="Dismiss">×</button>
    </div>
  );
}

export default NotifyToast;
