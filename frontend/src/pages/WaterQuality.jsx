import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TabBar from '../components/ui/TabBar';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { tankService } from '../services/tankService';
import { waterService } from '../services/waterService';

function WaterQuality() {
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState(0);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ pH: '', temperature: '', ammonia: '', nitrite: '', nitrate: '', dissolvedO2: '' });

  useEffect(() => {
    tankService.getAll().then((data) => {
      setTanks(data);
      setLoading(false);
    }).catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!tanks.length) return;
    const tankId = tanks[selectedTank]?.id;
    if (!tankId) return;

    Promise.all([
      waterService.getLatest(tankId),
      waterService.getHistory(tankId),
    ]).then(([lat, hist]) => {
      setLatest(lat);
      setHistory(hist);
    }).catch((err) => setError(err.message));
  }, [tanks, selectedTank]);

  const handleLog = async (e) => {
    e.preventDefault();
    const tankId = tanks[selectedTank]?.id;
    try {
      await waterService.logReading(tankId, {
        pH: form.pH ? parseFloat(form.pH) : null,
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        ammonia: form.ammonia ? parseFloat(form.ammonia) : null,
        nitrite: form.nitrite ? parseFloat(form.nitrite) : null,
        nitrate: form.nitrate ? parseFloat(form.nitrate) : null,
        dissolvedO2: form.dissolvedO2 ? parseFloat(form.dissolvedO2) : null,
      });
      setShowModal(false);
      setForm({ pH: '', temperature: '', ammonia: '', nitrite: '', nitrate: '', dissolvedO2: '' });
      const [lat, hist] = await Promise.all([
        waterService.getLatest(tankId),
        waterService.getHistory(tankId),
      ]);
      setLatest(lat);
      setHistory(hist);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-screen">
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Water Quality</div>
            <div className="page-subtitle">Monitor and log water parameters for all tanks</div>
          </div>
          <button type="button" className="btn btn-primary" disabled={!tanks.length} onClick={() => setShowModal(true)}>＋ Log Parameters</button>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : !tanks.length ? (
          <EmptyState icon="⚗️" title="No water quality data" message="Add a tank first, then log water parameters.">
            <Link to="/tanks" className="btn btn-primary" style={{ marginTop: '12px' }}>Go to My Tanks</Link>
          </EmptyState>
        ) : (
          <>
            <TabBar tabs={tanks.map((t) => t.name)} onChange={setSelectedTank} />

            <SectionHeader icon="⚗️" title="Current Readings">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {latest?.recordedAt ? `Last updated ${formatDate(latest.recordedAt)}` : 'No readings yet'}
              </span>
            </SectionHeader>

            {latest?.parameters ? (
              <div className="wq-grid" style={{ marginBottom: '1.5rem' }}>
                {latest.parameters.map((param) => (
                  <div key={param.label} className="wq-card">
                    <div className="wq-val" style={{ color: param.color }}>{param.display}</div>
                    <div className="wq-unit">{param.unit}</div>
                    <div className="wq-label">{param.label}</div>
                    <div className={`wq-indicator wq-${param.status}`} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="📋" title="No readings logged" message="Log your first water test to see parameters." />
            )}

            <div className="card">
              <SectionHeader icon="📋" iconVariant="light" title="Parameter History" />
              {history.length > 0 ? (
                <div className="table-wrap">
                  <table className="log-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th><th>pH</th><th>Temp (°C)</th><th>NH₃</th><th>NO₃</th><th>O₂</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => (
                        <tr key={row.date}>
                          <td>{formatDate(row.date)}</td>
                          <td className="log-val">{row.ph ?? '—'}</td>
                          <td className="log-val">{row.temp ?? '—'}</td>
                          <td className="log-val" style={row.nh3 > 0.01 ? { color: 'var(--warn)' } : undefined}>{row.nh3 ?? '—'}</td>
                          <td className="log-val" style={row.no3 > 20 ? { color: 'var(--warn)' } : undefined}>{row.no3 ?? '—'}</td>
                          <td className="log-val">{row.o2 ?? '—'}</td>
                          <td><span className={`log-badge ${row.status}`}>{row.status === 'ok' ? 'Optimal' : 'Watch'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="📋" title="No history" message="Parameter logs will appear here." />
              )}
            </div>
          </>
        )}

        {showModal && (
          <Modal title="Log Water Parameters" onClose={() => setShowModal(false)}>
            <form onSubmit={handleLog}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Logging for: <strong style={{ color: 'var(--white)' }}>{tanks[selectedTank]?.name}</strong>
              </p>
              <div className="form-row">
                <div className="form-group"><label className="form-label">pH</label><input className="form-input" type="number" step="0.1" value={form.pH} onChange={(e) => setForm({ ...form, pH: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Temp (°C)</label><input className="form-input" type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Ammonia (ppm)</label><input className="form-input" type="number" step="0.001" value={form.ammonia} onChange={(e) => setForm({ ...form, ammonia: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Nitrite (ppm)</label><input className="form-input" type="number" step="0.001" value={form.nitrite} onChange={(e) => setForm({ ...form, nitrite: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Nitrate (ppm)</label><input className="form-input" type="number" step="0.1" value={form.nitrate} onChange={(e) => setForm({ ...form, nitrate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Dissolved O₂</label><input className="form-input" type="number" step="0.1" value={form.dissolvedO2} onChange={(e) => setForm({ ...form, dissolvedO2: e.target.value })} /></div>
              </div>
              <button type="submit" className="auth-btn">Save Reading</button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default WaterQuality;
