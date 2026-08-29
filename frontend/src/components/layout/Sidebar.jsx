import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const plannerChildren = [
  { path: '/ai/plants', label: 'Plants' },
  { path: '/ai/species', label: 'Species' },
  { path: '/ai/designer', label: 'Designer' },
];

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⌂', end: true },
  { label: 'Planner', icon: '✦', children: plannerChildren },
  { path: '/tanks', label: 'My Tanks', icon: '◎' },
  { path: '/water', label: 'Water', icon: '◉' },
  { path: '/maintenance', label: 'Care', icon: '◷' },
  { path: '/growth', label: 'Growth', icon: '↗' },
  { path: '/equipment', label: 'Gear', icon: '⚙' },
  { path: '/profile', label: 'Profile', icon: '☺' },
  { path: '/help', label: 'Help', icon: '?' },
];

function Sidebar() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const plannerActive = plannerChildren.some((item) => location.pathname.startsWith(item.path));
  const [plannerOpen, setPlannerOpen] = useState(plannerActive);
  const expanded = hovered || pinned;

  useEffect(() => {
    document.body.classList.toggle('sidebar-expanded', expanded);
    return () => document.body.classList.remove('sidebar-expanded');
  }, [expanded]);

  const goHome = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`sidebar${expanded ? ' expanded' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button type="button" className="sidebar-logo" title="Sign out and go home" onClick={goHome}>
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Aqua Mind" />
        <span className="side-label sidebar-brand">Aqua Mind</span>
      </button>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          item.children ? (
            <div key={item.label} className="side-group">
              <button
                type="button"
                className={`side-link${plannerActive ? ' active' : ''}`}
                title={item.label}
                onClick={() => setPlannerOpen((v) => !v)}
              >
                <span className="side-icon">{item.icon}</span>
                <span className="side-label">{item.label}</span>
              </button>
              {plannerOpen && item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  title={child.label}
                  className={({ isActive }) => `side-link side-sub${isActive ? ' active' : ''}`}
                >
                  <span className="side-icon">·</span>
                  <span className="side-label">{child.label}</span>
                </NavLink>
              ))}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              title={item.label}
              className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
            >
              <span className="side-icon">{item.icon}</span>
              <span className="side-label">{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>
      <button
        type="button"
        className={`side-link sidebar-pin${pinned ? ' active' : ''}`}
        title={pinned ? 'Collapse sidebar' : 'Keep sidebar open'}
        onClick={() => setPinned((v) => !v)}
      >
        <span className="side-icon">{pinned ? '«' : '»'}</span>
        <span className="side-label">{pinned ? 'Collapse' : 'Keep open'}</span>
      </button>
      <button type="button" className="side-link sidebar-logout" title="Sign out" onClick={goHome}>
        <span className="side-icon">⎋</span>
        <span className="side-label">Sign out</span>
      </button>
    </aside>
  );
}

export default Sidebar;
