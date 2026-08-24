import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  ...plannerChildren,
];

function AppTopbar() {
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'AM';

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
      <div className="app-user">
        <span>{user?.username || 'Account'}</span>
        <button
          type="button"
          className="app-avatar"
          title="Sign out"
          onClick={() => {
            if (user) {
              logout();
              navigate('/');
            }
          }}
        >
          {initials}
        </button>
      </div>
    </header>
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
