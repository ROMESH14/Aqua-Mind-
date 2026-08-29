import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const plannerChildren = [
  { path: '/ai/plants', label: 'Plants' },
  { path: '/ai/species', label: 'Species' },
  { path: '/ai/designer', label: 'Designer' },
];

const searchTargets = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/tanks', label: 'My Tanks' },
  { path: '/water', label: 'Water' },
  { path: '/maintenance', label: 'Care' },
  { path: '/growth', label: 'Growth' },
  { path: '/equipment', label: 'Gear' },
  { path: '/profile', label: 'Profile' },
  { path: '/help', label: 'Help' },
  ...plannerChildren,
];

function AppTopbar() {
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'AM';
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (q.length < 2) return;
    const match = searchTargets.find((item) => item.label.toLowerCase().includes(q));
    if (match) {
      navigate(match.path);
      setQuery('');
    }
  };

  return (
    <header className="app-topbar">
      <MobileMenuButton />
      <div className="app-greet">
        <p className="app-greet-eyebrow">Your aquarium</p>
        <strong>Hello, {user?.username || 'there'}</strong>
        <span>{today}</span>
      </div>
      <form className="app-search" onSubmit={handleSearch}>
        <span aria-hidden>⌕</span>
        <input
          name="q"
          type="search"
          placeholder="Search modules..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <NotifyBell />
      <div className="app-user">
        <Link to="/profile" className="app-user-link">{user?.username || 'Account'}</Link>
        <Link to="/profile" className="app-avatar" aria-label="Open profile">
          {initials}
        </Link>
      </div>
    </header>
  );
}

function NotifyBell() {
  const notify = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeInbox = () => {
      notify.markInboxRead?.();
      setOpen(false);
    };
    const onDoc = (event) => {
      if (!wrapRef.current?.contains(event.target)) closeInbox();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') closeInbox();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!notify) return null;

  const toggle = async () => {
    const next = !open;
    if (!next) await notify.markInboxRead?.();
    setOpen(next);
    if (next) await notify.openInbox();
  };

  return (
    <div className="notify-wrap" ref={wrapRef}>
      <button
        type="button"
        className="notify-bell"
        aria-label="Open notifications"
        aria-expanded={open}
        onClick={toggle}
      >
        <span aria-hidden>🔔</span>
        {notify.unread > 0 && <em>{notify.unread > 9 ? '9+' : notify.unread}</em>}
      </button>
      {open && (
        <div className="notify-panel" role="dialog" aria-label="Notifications">
          <p className="notify-panel-title">Notifications</p>
          {notify.items?.length ? (
            <ul>
              {notify.items.map((item) => (
                <li key={item.id || item.tag || item.title}>
                  <Link
                    to={item.href || '/dashboard'}
                    className={item.read ? 'is-read' : 'is-unread'}
                    onClick={async () => {
                      await notify.markInboxRead?.();
                      setOpen(false);
                    }}
                  >
                    <strong>{item.title}</strong>
                    {item.detail && <span>{item.detail}</span>}
                    {item.time && <span>{item.time}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="notify-empty">No notifications yet. Water and task alerts will show here.</p>
          )}
        </div>
      )}
    </div>
  );
}

function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const plannerActive = plannerChildren.some((item) => location.pathname.startsWith(item.path));

  const close = () => setOpen(false);

  return (
    <>
      <button type="button" className="app-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        <div className="mobile-menu-backdrop" onClick={close} />
        <div className="mobile-menu-panel">
          <div className="mobile-menu-header">
            <strong>Aqua Mind</strong>
            <button type="button" className="mobile-menu-close" onClick={close}>✕</button>
          </div>
          <NavLink to="/dashboard" className="mobile-nav-link" onClick={close}>Dashboard</NavLink>
          <NavLink to="/ai/plants" className={`mobile-nav-link${plannerActive ? ' active' : ''}`} onClick={close}>Planner</NavLink>
          <NavLink to="/tanks" className="mobile-nav-link" onClick={close}>My Tanks</NavLink>
          <NavLink to="/water" className="mobile-nav-link" onClick={close}>Water</NavLink>
          <NavLink to="/maintenance" className="mobile-nav-link" onClick={close}>Care</NavLink>
          <NavLink to="/growth" className="mobile-nav-link" onClick={close}>Growth</NavLink>
          <NavLink to="/equipment" className="mobile-nav-link" onClick={close}>Gear</NavLink>
          <NavLink to="/profile" className="mobile-nav-link" onClick={close}>Profile</NavLink>
          <NavLink to="/help" className="mobile-nav-link" onClick={close}>Help</NavLink>
          <button
            type="button"
            className="mobile-nav-link mobile-nav-login"
            onClick={() => {
              logout();
              navigate('/');
              close();
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

export default AppTopbar;
