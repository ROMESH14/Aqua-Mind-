import { Link, NavLink } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';
import Select from '../ui/Select';
import PageHero from '../ui/PageHero';

function AdvisorPageShell({
  title,
  subtitle,
  requireTank = false,
  tanks = [],
  selectedTank,
  onTankChange,
  loading = false,
  error,
  emptyIcon = '🤖',
  emptyTitle = 'No tanks for AI analysis',
  children,
}) {
  return (
    <div className="page-screen">
      <div className="page">
        <PageHero eyebrow="Planner" title={title} subtitle={subtitle}>
          {requireTank && tanks.length > 0 && (
            <Select
              variant="header"
              value={selectedTank || ''}
              onChange={(e) => onTankChange(parseInt(e.target.value, 10))}
              aria-label="Select tank"
            >
              {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          )}
        </PageHero>

        <nav className="ai-subnav" aria-label="Planner modules">
          <NavLink to="/ai/plants" className={({ isActive }) => `ai-subnav-link${isActive ? ' active' : ''}`}>Plant Recommendation</NavLink>
          <NavLink to="/ai/species" className={({ isActive }) => `ai-subnav-link${isActive ? ' active' : ''}`}>Species Recommendation</NavLink>
          <NavLink to="/ai/designer" className={({ isActive }) => `ai-subnav-link${isActive ? ' active' : ''}`}>Tank Designer</NavLink>
        </nav>

        {error && <div className="form-error ai-page-error">{error}</div>}

        {requireTank && loading ? (
          <div className="ai-loading">Loading...</div>
        ) : requireTank && !tanks.length ? (
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
