import { Link, NavLink } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';
import Select from '../ui/Select';

function AdvisorPageShell({
  title,
  subtitle,
  tanks,
  selectedTank,
  onTankChange,
  loading,
  error,
  emptyIcon = '🤖',
  emptyTitle = 'No tanks for AI analysis',
  children,
}) {
  return (
    <div className="page-screen">
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">{title}</div>
            <div className="page-subtitle">{subtitle}</div>
          </div>
          {tanks.length > 0 && (
            <Select
              variant="header"
              value={selectedTank || ''}
              onChange={(e) => onTankChange(parseInt(e.target.value, 10))}
              aria-label="Select tank"
            >
              {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          )}
        </div>

        <nav className="ai-subnav" aria-label="AI modules">
          <NavLink to="/ai/species" className={({ isActive }) => `ai-subnav-link${isActive ? ' active' : ''}`}>Species Advisor</NavLink>
          <NavLink to="/ai/predictions" className={({ isActive }) => `ai-subnav-link${isActive ? ' active' : ''}`}>Water Prediction</NavLink>
          <NavLink to="/ai/plants" className={({ isActive }) => `ai-subnav-link${isActive ? ' active' : ''}`}>Planted Tank</NavLink>
        </nav>

        {error && <div className="form-error ai-page-error">{error}</div>}

        {loading ? (
          <div className="ai-loading">Loading...</div>
        ) : !tanks.length ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} message="Add a tank first, then run ML analysis.">
            <Link to="/tanks" className="btn btn-primary" style={{ marginTop: '12px' }}>Add a Tank</Link>
          </EmptyState>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default AdvisorPageShell;
