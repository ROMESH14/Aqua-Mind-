import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import GrowthChart from '../components/ui/GrowthChart';
import { tankService } from '../services/tankService';
import { growthService } from '../services/growthService';

function Growth() {
  const [tanks, setTanks] = useState([]);
  const [records, setRecords] = useState([]);
  const [tankFilter, setTankFilter] = useState('');
  const [fishFilter, setFishFilter] = useState('');
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
    setFishFilter('');
    try {
      setRecords(await growthService.getAll(value || undefined));
    } catch (err) {
      setError(err.message);
    }
  };

  const fishNames = useMemo(
    () => [...new Set(records.map((r) => r.fishName))].sort(),
    [records]
  );

  const visible = fishFilter ? records.filter((r) => r.fishName === fishFilter) : records;
  const chartRecords = fishFilter
    ? visible
    : records.filter((r) => r.fishName === fishNames[0]);

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

  const formatDate = (d) => new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="page-screen">
      <div className="page">
        <PageHero eyebrow="Tracking" title="Fish Growth" subtitle="Log length over time and watch development patterns">
          <Select value={tankFilter} onChange={(e) => handleTankFilter(e.target.value)} aria-label="Filter tank">
            <option value="">All tanks</option>
            {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
          <div className="growth-grid">
            <div className="card">
              <SectionHeader icon="📈" title={fishFilter ? `${fishFilter} — length trend` : (fishNames[0] ? `${fishNames[0]} — length trend` : 'Length trend')}>
                {fishNames.length > 0 && (
                  <Select value={fishFilter} onChange={(e) => setFishFilter(e.target.value)} aria-label="Filter fish">
                    <option value="">First fish on chart</option>
                    {fishNames.map((name) => <option key={name} value={name}>{name}</option>)}
                  </Select>
                )}
              </SectionHeader>
              {chartRecords.length > 0 ? (
                <GrowthChart records={chartRecords} />
              ) : (
                <EmptyState icon="📈" title="No measurements yet" message="Log length for a named fish to see the growth curve." />
              )}
            </div>

            <div className="card">
              <SectionHeader icon="📋" iconVariant="light" title="Measurement history" />
              {visible.length > 0 ? (
                <div className="table-wrap">
                  <table className="log-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Fish</th><th>Tank</th><th>Length</th><th>Weight</th><th>Notes</th><th />
                      </tr>
                    </thead>
                    <tbody>
                      {[...visible].reverse().map((row) => (
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
                <Select value={form.tankId} onChange={(e) => setForm({ ...form, tankId: e.target.value })} required>
                  <option value="">Select tank</option>
                  {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Fish name *</label>
                <input className="form-input" placeholder="e.g. Oscar 1" value={form.fishName} onChange={(e) => setForm({ ...form, fishName: e.target.value })} required />
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
