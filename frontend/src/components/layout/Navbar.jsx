import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', end: true },
  { path: '/tanks', label: 'My Tanks' },
  { path: '/water', label: 'Water Quality' },
  { path: '/maintenance', label: 'Maintenance' },
  { path: '/ai', label: 'AI Advisor' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMenu();
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || '👤';

  return (
    <>
      <nav className="nav">
        <NavLink to="/" className="nav-logo" onClick={closeMenu}>
          <Logo size="sm" />
        </NavLink>

        <div className="nav-tabs">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-notif" title="Alerts">🔔</div>
          <button type="button" className="nav-avatar" title={user?.username || 'Account'} onClick={handleLogout}>{initials}</button>
          <button
            type="button"
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="mobile-menu-backdrop" onClick={closeMenu} />
        <div className="mobile-menu-panel">
          <div className="mobile-menu-header">
            <Logo size="sm" />
            <button type="button" className="mobile-menu-close" onClick={closeMenu}>✕</button>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="mobile-nav-link mobile-nav-login" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
