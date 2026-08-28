import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import PageHero from '../components/ui/PageHero';
import { tankService } from '../services/tankService';
import { waterService } from '../services/waterService';
import { useNotifications } from '../context/NotificationContext';

const EMPTY_FORM = { pH: '', temperature: '', ammonia: '', nitrite: '', nitrate: '', dissolvedO2: '' };

const FIELDS = [
  { key: 'pH', label: 'pH', hint: '6.5–7.5', min: 0, max: 14, step: '0.1' },
  { key: 'temperature', label: 'Temp °C', hint: 'Type from thermometer', min: 5, max: 42, step: '0.1' },
  { key: 'ammonia', label: 'NH₃', hint: '0 ppm', min: 0, max: 10, step: '0.001' },
  { key: 'nitrite', label: 'NO₂', hint: '0 ppm', min: 0, max: 20, step: '0.001' },
  { key: 'nitrate', label: 'NO₃', hint: '<20', min: 0, max: 300, step: '0.1' },
  { key: 'dissolvedO2', label: 'O₂', hint: '>6', min: 0, max: 20, step: '0.1' },
];

const RESULT_COPY = {
  excellent: 'Water looks healthy',
  good: 'Water is acceptable',
  watch: 'Water needs a check',
  critical: 'Act on this tank now',
  ok: 'Water looks healthy',
  alert: 'Act on this tank now',
};

const FALLBACK_ACTIONS = {
  pH: { title: 'Correct pH slowly', detail: 'Change no more than 0.2 pH per day. Scale is 0–14.', priority: 'high' },
  Temperature: { title: 'Adjust temperature', detail: 'Move the heater 1°C at a time.', priority: 'high' },
  Ammonia: { title: 'Cut ammonia now', detail: '40–50% water change. Pause feeding 24 hours.', priority: 'critical' },
  Nitrite: { title: 'Treat nitrite', detail: 'Change 40% water. Add a nitrite detoxifier.', priority: 'critical' },
  Nitrate: { title: 'Lower nitrate', detail: '25–40% water change and vacuum the substrate.', priority: 'medium' },
  DissolvedO2: { title: 'Boost oxygen', detail: 'Aim the filter at the surface or add an air stone.', priority: 'high' },
};

function statusTone(status) {
  if (status === 'excellent' || status === 'good' || status === 'ok') return 'ok';
  if (status === 'critical' || status === 'alert' || status === 'bad') return 'alert';
  return 'warn';
}

function namesOf(list = []) {
  return list.map((item) => item?.name || item).filter(Boolean);
}

function cardLabel(param) {
  if (param.status === 'good') return 'Safe';
  if (param.key === 'pH' && Number(param.value) > 14) return 'Invalid';
  if (param.key === 'DissolvedO2' || (param.key === 'pH' && Number(param.value) < 6.5)) return 'Low';
  return param.status === 'bad' ? 'High' : 'Watch';
}

function validateForm(form) {
  const filled = FIELDS.some((field) => form[field.key] !== '');
  if (!filled) return 'Enter at least one reading, or upload a test photo.';
  for (const field of FIELDS) {
    if (form[field.key] === '') continue;
    const value = Number(form[field.key]);
    if (Number.isNaN(value) || value < field.min || value > field.max) {
      return `${field.label} must be ${field.min}–${field.max}.`;
    }
  }
  return '';
}

function buildActions(assessment, parameters = []) {
  if (assessment?.actions?.length) return assessment.actions.slice(0, 3);
  const fromParams = parameters
    .filter((param) => param.status !== 'good')
    .map((param) => ({
      ...(FALLBACK_ACTIONS[param.key] || { title: `Fix ${param.label}`, detail: param.unit, priority: 'high' }),
      param: param.key,
    }));
  return fromParams.slice(0, 3);
}

function fmtNum(value, digits = 1) {
  if (value == null || value === '') return '—';
  const num = Number(value);
  return Number.isNaN(num) ? '—' : num.toFixed(digits);
}

function fmtWhen(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function historyStatusLabel(status) {
  if (status === 'ok') return 'Safe';
  if (status === 'alert') return 'Action';
  return 'Watch';
}

function fileToDataUrl(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}

function WaterQuality() {
  const notify = useNotifications();
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState(0);
  const [latest, setLatest] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [scanPreview, setScanPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [formOpen, setFormOpen] = useState(true);
  const fileRef = useRef(null);

  const tank = tanks[selectedTank];
  const fishNames = namesOf(tank?.fishNames);
  const plantNames = namesOf(tank?.plantNames);

  const loadTankData = async (tankId) => {
    const [lat, rows] = await Promise.all([
      waterService.getLatest(tankId),
      waterService.getHistory(tankId).catch(() => []),
    ]);
    setLatest(lat);
    setAssessment(lat?.assessment || null);
    setHistory(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    Promise.all([tankService.getAll(), waterService.getModel().catch(() => null)])
      .then(([data]) => {
        setTanks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!tank?.id) return;
    setDraftId(null);
    setForm(EMPTY_FORM);
    setScanPreview('');
    setFormOpen(true);
    loadTankData(tank.id).catch((err) => setError(err.message));
  }, [tanks, selectedTank]);

  const applyScanValues = (values) => {
    setForm((current) => ({
      pH: values.pH != null ? String(values.pH) : '',
      temperature: current.temperature,
      ammonia: values.ammonia != null ? String(values.ammonia) : '',
      nitrite: values.nitrite != null ? String(values.nitrite) : '',
      nitrate: values.nitrate != null ? String(values.nitrate) : '',
      dissolvedO2: values.dissolvedO2 != null ? String(values.dissolvedO2) : '',
    }));
  };

  const handleFile = async (file) => {
    if (!file || !tank?.id) return;
    setError('');
    setScanning(true);
    try {
      const image = await fileToDataUrl(file);
      setScanPreview(image);
      const scanned = await waterService.scanReading(tank.id, image);
      applyScanValues(scanned);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleLog = async (e) => {
    e.preventDefault();
    if (!tank?.id) return;
    const invalid = validateForm(form);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await waterService.logReading(tank.id, {
        pH: form.pH ? parseFloat(form.pH) : null,
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        ammonia: form.ammonia ? parseFloat(form.ammonia) : null,
        nitrite: form.nitrite ? parseFloat(form.nitrite) : null,
        nitrate: form.nitrate ? parseFloat(form.nitrate) : null,
        dissolvedO2: form.dissolvedO2 ? parseFloat(form.dissolvedO2) : null,
      });
      setAssessment(saved.assessment || null);
      setDraftId(null);
      setForm(EMPTY_FORM);
      setScanPreview('');
      setFormOpen(false);
      if (saved.notify) notify?.announce(saved.notify);
      await loadTankData(tank.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadHistoryDraft = (row) => {
    setForm({
      pH: row.ph != null ? String(row.ph) : '',
      temperature: row.temp != null ? String(row.temp) : '',
      ammonia: row.nh3 != null ? String(row.nh3) : '',
      nitrite: row.no2 != null ? String(row.no2) : '',
      nitrate: row.no3 != null ? String(row.no3) : '',
      dissolvedO2: row.o2 != null ? String(row.o2) : '',
    });
    setDraftId(row.id);
    setError('');
    setScanPreview('');
    setFormOpen(true);
  };

  const resultTone = statusTone(assessment?.status);
  const draftRow = history.find((row) => row.id === draftId);
  const actions = buildActions(assessment, latest?.parameters);
  const showActions = assessment && !['excellent', 'ok'].includes(assessment.status);

  return (
    <div className="page-screen">
      <div className="page wq-page">
        <PageHero eyebrow="Water test" title="Water Quality">
          {tanks.length > 0 && (
            <Select
              variant="header"
              value={selectedTank}
              onChange={(e) => setSelectedTank(parseInt(e.target.value, 10))}
              aria-label="Select tank"
            >
              {tanks.map((item, index) => (
                <option key={item.id} value={index}>{item.name}</option>
              ))}
            </Select>
          )}
        </PageHero>

        {loading ? (
          <div className="wq-muted">Loading...</div>
        ) : !tanks.length ? (
          <EmptyState icon="⚗️" title="No tanks yet" message="Add a tank first, then log a water test.">
            <Link to="/tanks" className="btn btn-primary" style={{ marginTop: '12px' }}>Go to My Tanks</Link>
          </EmptyState>
        ) : (
          <div className="wq-onepage">
            {!formOpen ? (
              <div className="card wq-entry wq-entry-closed">
                <div className="wq-entry-head">
                  <div>
                    <p className="wq-tankbar-kicker">Test saved</p>
                    <h2>{tank.name}</h2>
                    <p>Today’s test is logged. Results are on the right.</p>
                  </div>
                </div>
                {error && <div className="form-error">{error}</div>}
                <button type="button" className="btn btn-primary wq-save" onClick={() => setFormOpen(true)}>
                  Add another test
                </button>
              </div>
            ) : (
            <form className="card wq-entry" onSubmit={handleLog} noValidate>
              <div className="wq-entry-head">
                <div>
                  <p className="wq-tankbar-kicker">Add today’s test</p>
                  <h2>{tank.name}</h2>
                  <p>{[tank.meta, ...fishNames, ...plantNames].filter(Boolean).join(' · ')}</p>
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}
              {draftRow && (
                <p className="wq-draft-note">
                  Draft from {fmtWhen(draftRow.date)}. Edit if needed, then save as a new test.
                </p>
              )}

              <div className="wq-live-grid">
                {FIELDS.map((field) => (
                  <label key={field.key} className="wq-field" htmlFor={`wq-${field.key}`}>
                    <span>{field.label}</span>
                    <input
                      id={`wq-${field.key}`}
                      className="form-input"
                      type="number"
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      placeholder={field.hint}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  </label>
                ))}
              </div>

              <div
                className="wq-dropzone wq-dropzone-inline"
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter') fileRef.current?.click(); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
              >
                {scanPreview ? <img src={scanPreview} alt="Test kit preview" /> : (
                  <span>{scanning ? 'Reading photo…' : 'Drop or click to add a test-kit photo'}</span>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />

              <button type="submit" className="btn btn-primary wq-save" disabled={saving || scanning}>
                {saving ? 'Saving…' : scanning ? 'Reading photo…' : 'Save test'}
              </button>
            </form>
            )}

            {latest?.parameters ? (
              <div className="card wq-readings">
                <div className="wq-grid wq-grid-compact">
                  {latest.parameters.map((param) => (
                    <div key={param.label} className={`wq-card wq-card-${param.status}`}>
                      <div className="wq-val" style={{ color: param.color }}>{param.display}</div>
                      <div className="wq-label">{param.label}</div>
                      <span className={`wq-chip wq-chip-${param.status}`}>{cardLabel(param)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card wq-readings wq-readings-empty">
                <p className="wq-muted">Save a test to see the six readings here.</p>
              </div>
            )}

            <section className={`wq-result wq-result-${assessment ? resultTone : 'idle'}`}>
              {assessment ? (
                <>
                  <div className="wq-result-top">
                    <div>
                      <p className="wq-result-kicker">{resultTone === 'ok' ? 'All good' : resultTone === 'alert' ? 'Needs action' : 'Watch'}</p>
                      <h2 className="wq-result-title">{RESULT_COPY[assessment.status] || 'Result'}</h2>
                    </div>
                    <div className="wq-result-score">
                      <strong>{assessment.score}</strong>
                      <span>/ 100</span>
                    </div>
                  </div>
                  {showActions && (
                    <ol className="wq-actions">
                      {actions.map((action, index) => (
                        <li key={`${action.param}-${action.title}`} className={`wq-action wq-action-${action.priority}`}>
                          <span className="wq-action-num">{index + 1}</span>
                          <div>
                            <h3>{action.title}</h3>
                            <p>{action.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </>
              ) : (
                <p className="wq-muted">Type the numbers or add a photo, then save to see the result.</p>
              )}
            </section>

            <section className="card wq-history">
              <div className="wq-history-head">
                <p className="wq-tankbar-kicker">Reading history</p>
                <h2>Past tests</h2>
                <p>Click a row to load it as a draft in the form.</p>
              </div>
              {history.length ? (
                <div className="table-wrap wq-history-wrap">
                  <table className="log-table wq-history-table">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>pH</th>
                        <th>Temp</th>
                        <th>NH₃</th>
                        <th>NO₂</th>
                        <th>NO₃</th>
                        <th>O₂</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 12).map((row, index) => (
                        <tr
                          key={row.id || `${row.date}-${index}`}
                          className={row.id === draftId ? 'is-draft' : ''}
                          onClick={() => loadHistoryDraft(row)}
                        >
                          <td>{fmtWhen(row.date)}</td>
                          <td className="log-val">{fmtNum(row.ph, 2)}</td>
                          <td className="log-val">{fmtNum(row.temp, 1)}</td>
                          <td className="log-val">{fmtNum(row.nh3, 3)}</td>
                          <td className="log-val">{fmtNum(row.no2, 3)}</td>
                          <td className="log-val">{fmtNum(row.no3, 1)}</td>
                          <td className="log-val">{fmtNum(row.o2, 1)}</td>
                          <td>
                            <span className={`log-badge ${row.status}`}>{historyStatusLabel(row.status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wq-muted wq-history-empty">No past tests yet. Save today’s numbers to start the log.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaterQuality;
