import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import GrowthChart from '../components/ui/GrowthChart';
import { tankService } from '../services/tankService';
import { growthService } from '../services/growthService';

const PAGE_SIZE = 4;

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  return [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
}

function fishOnTank(tank) {
  return (tank?.fishNames || []).map((item) => item?.name || item).filter(Boolean);
}

function Growth() {
  const [tanks, setTanks] = useState([]);
  const [records, setRecords] = useState([]);
  const [tankFilter, setTankFilter] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ tankId: '', fishName: '', lengthCm: '', weightG: '', notes: '' });

  const load = async (tankId = tankFilter) => {
    try {
      const [tankData, growthData] = await Promise.all([
        tankService.getAll(),
        growthService.getAll(tankId || undefined),
      ]);
      setTanks(tankData);
      setRecords(growthData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTankFilter = async (value) => {
    setTankFilter(value);
    setLogPage(1);
    try {
      setRecords(await growthService.getAll(value || undefined));
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = records;
  const sortedAll = [...records].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const latest = sortedAll[sortedAll.length - 1];
  const first = sortedAll[0];
  const change = latest && first ? Number(latest.lengthCm) - Number(first.lengthCm) : null;

  const history = [...visible].reverse();
  const pages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const page = Math.min(logPage, pages);
  const pageRows = history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = history.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, history.length);

  const formTank = tanks.find((tank) => String(tank.id) === String(form.tankId));
  const formFish = fishOnTank(formTank);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await growthService.create({
        tankId: parseInt(form.tankId, 10),
        fishName: form.fishName,
        lengthCm: parseFloat(form.lengthCm),
        weightG: form.weightG ? parseFloat(form.weightG) : null,
        notes: form.notes,
      });
      setShowModal(false);
      setForm({ tankId: '', fishName: '', lengthCm: '', weightG: '', notes: '' });
      setLogPage(1);
      await load(tankFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await growthService.remove(id);
      await load(tankFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (value) => new Date(value).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="page-screen">
      <div className="page growth-page">
        <PageHero inlineActions eyebrow="Tracking" title="Fish Growth" subtitle="Measure length over time and watch each fish develop">
          <Select variant="header" value={tankFilter} onChange={(e) => handleTankFilter(e.target.value)} aria-label="Filter tank">
            <option value="">All tanks</option>
            {tanks.map((tank) => <option key={tank.id} value={tank.id}>{tank.name}</option>)}
          </Select>
          <button type="button" className="btn btn-primary" disabled={!tanks.length} onClick={() => setShowModal(true)}>
            ＋ Log measurement
          </button>
        </PageHero>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {!tanks.length ? (
          <EmptyState icon="🐠" title="Add a tank first" message="Growth records are tied to a tank.">
            <Link to="/tanks" className="btn btn-primary" style={{ marginTop: '12px' }}>Go to My Tanks</Link>
          </EmptyState>
        ) : (
          <div className="growth-board">
            <div className="growth-kpis">
              <div className="growth-kpi">
                <span>Logs</span>
                <strong>{visible.length}</strong>
              </div>
              <div className="growth-kpi">
                <span>Latest</span>
                <strong>{latest ? `${Number(latest.lengthCm).toFixed(1)} cm` : '—'}</strong>
              </div>
              <div className={`growth-kpi${change > 0 ? ' is-up' : ''}${change < 0 ? ' is-down' : ''}`}>
                <span>Change</span>
                <strong>
                  {change == null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)} cm`}
                </strong>
              </div>
            </div>

            <div className="card growth-chart-card">
              <SectionHeader icon="📈" title="All fish — length" />
              {records.length > 0 ? (
                <GrowthChart records={records} />
              ) : (
                <EmptyState icon="📈" title="No measurements yet" message="Log a length for a named fish to start the curve." />
              )}
            </div>

            <div className="card growth-log-card">
              <SectionHeader icon="📋" iconVariant="light" title="Measurement history" />
              {history.length > 0 ? (
                <>
                  <div className="table-wrap">
                    <table className="log-table">
                      <thead>
                        <tr>
                          <th>Date</th><th>Fish</th><th>Tank</th><th>Length</th><th>Weight</th><th>Notes</th><th />
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((row) => (
                          <tr key={row.id}>
                            <td>{formatDate(row.recordedAt)}</td>
                            <td className="log-val">{row.fishName}</td>
                            <td>{row.tankName}</td>
                            <td className="log-val">{row.lengthCm} cm</td>
                            <td>{row.weightG != null ? `${row.weightG} g` : '—'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{row.notes || '—'}</td>
                            <td>
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(row.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pager">
                    <span className="pager-meta">{from}–{to} of {history.length}</span>
                    <div className="pager-btns">
                      <button type="button" className="pager-btn" disabled={page <= 1} onClick={() => setLogPage(page - 1)}>Prev</button>
                      {pageNumbers(page, pages).map((n, i, arr) => (
                        <span key={n} className="pager-group">
                          {i > 0 && n - arr[i - 1] > 1 && <em className="pager-gap">…</em>}
                          <button type="button" className={`pager-btn${n === page ? ' is-current' : ''}`} onClick={() => setLogPage(n)}>{n}</button>
                        </span>
                      ))}
                      <button type="button" className="pager-btn" disabled={page >= pages} onClick={() => setLogPage(page + 1)}>Next</button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState icon="📋" title="No history" message="Each log stores fish name, length, and optional weight." />
              )}
            </div>
          </div>
        )}

        {showModal && (
          <Modal title="Log growth measurement" onClose={() => setShowModal(false)}>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Tank *</label>
                <Select
                  value={form.tankId}
                  onChange={(e) => setForm({ ...form, tankId: e.target.value, fishName: '' })}
                  required
                >
                  <option value="">Select tank</option>
                  {tanks.map((tank) => <option key={tank.id} value={tank.id}>{tank.name}</option>)}
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Fish name *</label>
                {formFish.length > 0 && (
                  <div className="growth-chips growth-chips-form">
                    {formFish.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={`growth-chip${form.fishName === name ? ' is-on' : ''}`}
                        onClick={() => setForm({ ...form, fishName: name })}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  className="form-input"
                  placeholder="e.g. Oscar 1"
                  value={form.fishName}
                  onChange={(e) => setForm({ ...form, fishName: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Length (cm) *</label>
                  <input className="form-input" type="number" step="0.1" min="0.1" value={form.lengthCm} onChange={(e) => setForm({ ...form, lengthCm: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (g)</label>
                  <input className="form-input" type="number" step="0.1" min="0" value={form.weightG} onChange={(e) => setForm({ ...form, weightG: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" className="auth-btn">Save measurement</button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Growth;
