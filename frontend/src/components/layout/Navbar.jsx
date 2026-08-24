import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

const plannerChildren = [
  { path: '/ai/plants', label: 'Plant Recommendation' },
  { path: '/ai/species', label: 'Species Recommendation' },
  { path: '/ai/designer', label: 'Tank Designer' },
];

const navItems = [
  { path: '/dashboard', label: 'Dashboard', end: true },
  { label: 'Planner', children: plannerChildren },
  { path: '/tanks', label: 'My Tanks' },
  { path: '/water', label: 'Water Quality' },
  { path: '/maintenance', label: 'Maintenance' },
  { path: '/growth', label: 'Growth' },
  { path: '/equipment', label: 'Equipment' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [mobilePlannerOpen, setMobilePlannerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const plannerRef = useRef(null);

  const plannerActive = plannerChildren.some((item) => location.pathname.startsWith(item.path));

  const closeMenu = () => {
    setMenuOpen(false);
    setPlannerOpen(false);
    setMobilePlannerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  useEffect(() => {
    const onPointerDown = (event) => {
      if (plannerRef.current && !plannerRef.current.contains(event.target)) {
        setPlannerOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const initials = user?.username?.slice(0, 2).toUpperCase() || '👤';

  return (
    <>
      <nav className="nav">
        <NavLink to="/" className="nav-logo" onClick={closeMenu}>
          <Logo size="sm" />
        </NavLink>

        <div className="nav-tabs">
          {navItems.map((item) => (
            item.children ? (
              <div key={item.label} className="nav-dropdown" ref={plannerRef}>
                <button
                  type="button"
                  className={`nav-tab nav-tab-button${plannerActive || plannerOpen ? ' active' : ''}`}
                  aria-expanded={plannerOpen}
                  aria-haspopup="true"
                  onClick={() => setPlannerOpen((open) => !open)}
                >
                  {item.label}
                  <span className={`nav-caret${plannerOpen ? ' open' : ''}`} aria-hidden>▾</span>
                </button>
                {plannerOpen && (
                  <div className="nav-dropdown-menu" role="menu">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        role="menuitem"
                        className={({ isActive }) => `nav-dropdown-link${isActive ? ' active' : ''}`}
                        onClick={closeMenu}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            )
          ))}
        </div>

        <div className="nav-right">
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
            <NavLink to="/" className="nav-logo" onClick={closeMenu}>
              <Logo size="sm" />
            </NavLink>
            <button type="button" className="mobile-menu-close" onClick={closeMenu}>✕</button>
          </div>
          {navItems.map((item) => (
            item.children ? (
              <div key={item.label} className="mobile-nav-group">
                <button
                  type="button"
                  className={`mobile-nav-link mobile-nav-parent${plannerActive || mobilePlannerOpen ? ' active' : ''}`}
                  onClick={() => setMobilePlannerOpen((open) => !open)}
                >
                  {item.label}
                  <span className={`nav-caret${mobilePlannerOpen ? ' open' : ''}`} aria-hidden>▾</span>
                </button>
                {mobilePlannerOpen && item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) => `mobile-nav-link mobile-nav-sub${isActive ? ' active' : ''}`}
                    onClick={closeMenu}
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            )
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
