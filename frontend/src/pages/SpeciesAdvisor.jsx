import { useEffect, useState } from 'react';
import AdvisorPageShell from '../components/ai/AdvisorPageShell';
import SourceTag from '../components/ai/SourceTag';
import { AdvisorEmptyState, FishSuggestionCard } from '../components/ai/SuggestionCard';
import { enrichFishList } from '../utils/enrichAiResults';
import Select from '../components/ui/Select';
import { aiService } from '../services/aiService';
import { planService } from '../services/planService';

const DEFAULT_FISH = {
  tankType: '',
  volumeLiters: '',
  experience: '',
  temperament: '',
  planted: '',
  groupSize: '',
  ph: '',
  temperature: '',
  ammonia: '',
  nitrate: '',
};

function formIncomplete(form) {
  return Object.values(form).some((value) => String(value ?? '').trim() === '');
}

function SpeciesAdvisor() {
  const [fishForm, setFishForm] = useState(DEFAULT_FISH);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyQuery, setHistoryQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const loadHistory = async (query = historyQuery) => {
    try {
      setHistory(await planService.list(query, 'species'));
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory('');
  }, []);

  const update = (field) => (e) => setFishForm({ ...fishForm, [field]: e.target.value });

  const runAnalysis = async () => {
    if (formIncomplete(fishForm)) {
      setError('Fill every field so the species list matches your tank.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const data = await aiService.analyzeFish({ ...fishForm, nitrite: fishForm.nitrite || '0' });
      setResult({ ...data, recommendations: enrichFishList(data.recommendations || []) });
      setSavedId(null);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveResult = async () => {
    if (!result || savedId) return;
    setSaving(true);
    setError('');
    try {
      const saved = await planService.save({
        kind: 'species',
        title: `${fishForm.volumeLiters}L ${fishForm.tankType} species plan`,
        form: fishForm,
        result,
      });
      setSavedId(saved.id);
      await loadHistory(historyQuery);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openSaved = (plan) => {
    if (plan.form) setFishForm({ ...DEFAULT_FISH, ...plan.form });
    setResult({
      ...plan.result,
      recommendations: enrichFishList(plan.result?.recommendations || []),
    });
    setSavedId(plan.id);
    setShowResults(true);
  };

  const deleteSaved = async (event, id) => {
    event.stopPropagation();
    await planService.remove(id);
    if (savedId === id) setSavedId(null);
    await loadHistory(historyQuery);
  };

  const closeResults = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowResults(false);
  };

  return (
    <AdvisorPageShell
      title="Species Recommendation"
      subtitle="Answer a few questions about the tank you want to stock. No existing tank required."
      error={error}
      emptyIcon="🐟"
    >
      <div className="ai-card ai-panel ai-page-panel">
        <div className="ai-panel-head">
          <div className="ai-title">
            {showResults ? '🐟 Suggested species' : '🐟 New tank species plan'}
            <span className="ai-badge">AI</span>
          </div>
          {showResults ? (
            <div className="ai-head-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeResults}>
                ← Edit answers
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={saveResult} disabled={saving || !!savedId}>
                {savedId ? 'Saved' : saving ? 'Saving...' : 'Save result'}
              </button>
              <button type="button" className="plan-close-btn" onClick={closeResults} aria-label="Close results">
                ✕
              </button>
            </div>
          ) : (
            <SourceTag source={result?.source} />
          )}
        </div>

        {!showResults ? (
          <div className="ai-panel-body ai-panel-body--form">
            <div className="ai-input-col">
              <p className="ai-panel-hint">Tell us about the new aquarium so we can suggest compatible fish.</p>
              <div className="ai-form-grid">
                <div className="form-group">
                  <label className="form-label">Tank type</label>
                  <Select value={fishForm.tankType} onChange={update('tankType')}>
                    <option value="">Select</option>
                    <option value="Community">Community</option>
                    <option value="Planted">Planted</option>
                    <option value="Monster Fish">Monster Fish</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Volume (L)</label>
                  <input className="form-input" type="number" min="10" placeholder="e.g. 60" value={fishForm.volumeLiters} onChange={update('volumeLiters')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Your experience</label>
                  <Select value={fishForm.experience} onChange={update('experience')}>
                    <option value="">Select</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Some experience</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Temperament</label>
                  <Select value={fishForm.temperament} onChange={update('temperament')}>
                    <option value="">Select</option>
                    <option value="peaceful">Peaceful</option>
                    <option value="semi">Semi-aggressive</option>
                    <option value="predator">Predator</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Planted tank</label>
                  <Select value={fishForm.planted} onChange={update('planted')}>
                    <option value="">Select</option>
                    <option value="yes">Yes, planted</option>
                    <option value="some">A few plants</option>
                    <option value="no">No plants</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Group style</label>
                  <Select value={fishForm.groupSize} onChange={update('groupSize')}>
                    <option value="">Select</option>
                    <option value="school">Schooling fish</option>
                    <option value="pairs">Pairs / small groups</option>
                    <option value="centerpiece">One centerpiece</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">pH</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 7.0" value={fishForm.ph} onChange={update('ph')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Temp (°C)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 25" value={fishForm.temperature} onChange={update('temperature')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ammonia (ppm)</label>
                  <input className="form-input" type="number" step="0.01" placeholder="e.g. 0" value={fishForm.ammonia} onChange={update('ammonia')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nitrate (ppm)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 10" value={fishForm.nitrate} onChange={update('nitrate')} />
                </div>
              </div>
              <div className="ai-form-actions">
                <button type="button" className="btn btn-primary" onClick={runAnalysis} disabled={analyzing}>
                  {analyzing ? 'Analyzing...' : 'Get recommendations'}
                </button>
              </div>
            </div>
            <aside className="plan-history-panel">
              <div className="plan-history-tabs">
                <span className="plan-history-tab is-active">Search history</span>
              </div>
              <input
                className="form-input"
                type="search"
                placeholder="Search past results..."
                value={historyQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setHistoryQuery(value);
                  loadHistory(value);
                }}
              />
              {history.length > 0 ? (
                <ul className="plan-history-list">
                  {history.map((plan) => (
                    <li key={plan.id}>
                      <button type="button" className="plan-history-item" onClick={() => openSaved(plan)}>
                        <strong>{plan.title}</strong>
                        <em>
                          {(plan.result?.recommendations || []).slice(0, 3).map((p) => p.name).join(', ')
                            || 'Saved species plan'}
                        </em>
                        <span>{plan.createdAt ? new Date(plan.createdAt).toLocaleString() : 'Saved locally'}</span>
                      </button>
                      <button type="button" className="plan-history-delete" onClick={(e) => deleteSaved(e, plan.id)} aria-label="Delete saved plan">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ai-msg">No past results yet. Get recommendations, then save to see them here.</p>
              )}
            </aside>
          </div>
        ) : (
          <div className="ai-panel-body ai-panel-body--results">
            <div className="ai-output-col">
              {result?.recommendations?.length > 0 ? (
                <>
                  <p className="ai-output-label">Suggested species for this new tank</p>
                  <div className="suggestion-grid suggestion-grid-plants">
                    {result.recommendations.map((fish) => (
                      <FishSuggestionCard key={fish.name} item={fish} />
                    ))}
                  </div>
                  {result.warning && <div className="ai-warning">⚠ {result.warning}</div>}
                  {result.message && <p className="ai-msg">{result.message}</p>}
                  <div className="ai-form-actions">
                    <button type="button" className="btn btn-primary" onClick={saveResult} disabled={saving || !!savedId}>
                      {savedId ? 'Saved' : saving ? 'Saving...' : 'Save result'}
                    </button>
                  </div>
                </>
              ) : (
                <AdvisorEmptyState icon="🐟" title="No results yet" message="Fill the new-tank questions and get species recommendations." />
              )}
            </div>
          </div>
        )}
      </div>
    </AdvisorPageShell>
  );
}

export default SpeciesAdvisor;
