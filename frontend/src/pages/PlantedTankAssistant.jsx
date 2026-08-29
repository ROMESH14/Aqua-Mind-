import { useEffect, useState } from 'react';
import AdvisorPageShell from '../components/ai/AdvisorPageShell';
import SourceTag from '../components/ai/SourceTag';
import { AdvisorEmptyState, PlantSuggestionCard } from '../components/ai/SuggestionCard';
import { enrichPlantList } from '../utils/enrichAiResults';
import Select from '../components/ui/Select';
import { aiService } from '../services/aiService';
import { planService } from '../services/planService';

const DEFAULT_PLANTS = {
  volumeLiters: '',
  tankType: '',
  style: '',
  experience: '',
  lighting: '',
  co2: '',
  substrate: '',
  hardscape: '',
  maintenance: '',
  livestock: '',
  ph: '',
  temperature: '',
  waterHardness: '',
  fertilizer: '',
  flow: '',
  plantGoal: '',
  waterChange: '',
  budget: '',
};

function formIncomplete(form) {
  return Object.values(form).some((value) => String(value ?? '').trim() === '');
}

function PlantedTankAssistant() {
  const [plantForm, setPlantForm] = useState(DEFAULT_PLANTS);
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
      setHistory(await planService.list(query, 'plants'));
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory('');
  }, []);

  const update = (field) => (e) => setPlantForm({ ...plantForm, [field]: e.target.value });

  const runAnalysis = async () => {
    if (formIncomplete(plantForm)) {
      setError('Fill every field so the plant plan matches your tank.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const data = await aiService.analyzePlants({
        ...plantForm,
        volumeLiters: Number(plantForm.volumeLiters) || 60,
        theme: plantForm.style,
      });
      setResult({ ...data, plants: enrichPlantList(data.plants || []) });
      setSavedId(null);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const design = result?.design;

  const saveResult = async () => {
    if (!result || savedId) return;
    setSaving(true);
    setError('');
    try {
      const saved = await planService.save({
        kind: 'plants',
        title: `${plantForm.volumeLiters}L ${plantForm.style} plant plan`,
        form: plantForm,
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
    if (plan.form) setPlantForm({ ...DEFAULT_PLANTS, ...plan.form });
    setResult({
      ...plan.result,
      plants: enrichPlantList(plan.result?.plants || []),
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

  return (
    <AdvisorPageShell
      title="Plant Recommendation"
      subtitle="Answer a few questions about the tank you want to build. No existing tank required."
      error={error}
      emptyIcon="🌿"
    >
      <div className="ai-card ai-panel ai-page-panel">
        <div className="ai-panel-head">
          <div className="ai-title">
            {showResults ? '🌿 Your tank ideas' : '🌿 New tank plant plan'}
            <span className="ai-badge">AI</span>
          </div>
          {showResults ? (
            <div className="ai-head-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowResults(false)}>
                ← Edit answers
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={saveResult} disabled={saving || !!savedId}>
                {savedId ? 'Saved' : saving ? 'Saving...' : 'Save result'}
              </button>
              <button
                type="button"
                className="plan-close-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowResults(false);
                }}
                aria-label="Close results"
              >
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
            <p className="ai-panel-hint">Tell us about the new aquarium so we can suggest plants and a layout idea.</p>
            <div className="ai-form-grid">
              <div className="form-group">
                <label className="form-label">Tank size (L)</label>
                <input className="form-input" type="number" min="10" placeholder="e.g. 60" value={plantForm.volumeLiters} onChange={update('volumeLiters')} />
              </div>
              <div className="form-group">
                <label className="form-label">Tank type</label>
                <Select value={plantForm.tankType} onChange={update('tankType')}>
                  <option value="">Select</option>
                  <option value="Planted">Planted</option>
                  <option value="Community">Community</option>
                  <option value="Monster Fish">Monster Fish</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Aquascape style</label>
                <Select value={plantForm.style} onChange={update('style')}>
                  <option value="">Select</option>
                  <option value="nature">Nature / aquascape</option>
                  <option value="dutch">Dutch (stem plants)</option>
                  <option value="iwagumi">Iwagumi (stone)</option>
                  <option value="jungle">Jungle / densely planted</option>
                  <option value="community">Simple community</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Your experience</label>
                <Select value={plantForm.experience} onChange={update('experience')}>
                  <option value="">Select</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Some experience</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Lighting</label>
                <Select value={plantForm.lighting} onChange={update('lighting')}>
                  <option value="">Select</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">CO₂</label>
                <Select value={plantForm.co2} onChange={update('co2')}>
                  <option value="">Select</option>
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Substrate</label>
                <Select value={plantForm.substrate} onChange={update('substrate')}>
                  <option value="">Select</option>
                  <option value="aqua-soil">Aqua soil</option>
                  <option value="sand">Sand</option>
                  <option value="gravel">Gravel</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Hardscape</label>
                <Select value={plantForm.hardscape} onChange={update('hardscape')}>
                  <option value="">Select</option>
                  <option value="none">None yet</option>
                  <option value="wood">Driftwood</option>
                  <option value="rock">Rocks</option>
                  <option value="wood-rock">Wood and rocks</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Time for care</label>
                <Select value={plantForm.maintenance} onChange={update('maintenance')}>
                  <option value="">Select</option>
                  <option value="low">Low (easy plants)</option>
                  <option value="medium">A few hours a week</option>
                  <option value="high">High (trimming / CO₂)</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Who will live there</label>
                <Select value={plantForm.livestock} onChange={update('livestock')}>
                  <option value="">Select</option>
                  <option value="plants-only">Plants only</option>
                  <option value="shrimp">Shrimp / snails</option>
                  <option value="community">Community fish</option>
                  <option value="none">Not decided yet</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Target pH</label>
                <input className="form-input" type="number" step="0.1" min="5" max="9" placeholder="e.g. 6.8" value={plantForm.ph} onChange={update('ph')} />
              </div>
              <div className="form-group">
                <label className="form-label">Target temp (°C)</label>
                <input className="form-input" type="number" step="0.1" min="15" max="34" placeholder="e.g. 25" value={plantForm.temperature} onChange={update('temperature')} />
              </div>
              <div className="form-group">
                <label className="form-label">Water hardness</label>
                <Select value={plantForm.waterHardness} onChange={update('waterHardness')}>
                  <option value="">Select</option>
                  <option value="soft">Soft</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard / tap</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Fertilizer</label>
                <Select value={plantForm.fertilizer} onChange={update('fertilizer')}>
                  <option value="">Select</option>
                  <option value="none">None</option>
                  <option value="liquid">Liquid only</option>
                  <option value="root-tabs">Root tabs</option>
                  <option value="both">Liquid and root tabs</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Filter flow</label>
                <Select value={plantForm.flow} onChange={update('flow')}>
                  <option value="">Select</option>
                  <option value="low">Gentle</option>
                  <option value="medium">Medium</option>
                  <option value="high">Strong</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Plant goal</label>
                <Select value={plantForm.plantGoal} onChange={update('plantGoal')}>
                  <option value="">Select</option>
                  <option value="easy-green">Easy green plants</option>
                  <option value="carpet">Foreground carpet</option>
                  <option value="colorful">Colorful / red stems</option>
                  <option value="low-tech">Low-tech, low work</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Water changes</label>
                <Select value={plantForm.waterChange} onChange={update('waterChange')}>
                  <option value="">Select</option>
                  <option value="weekly">Every week</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Once a month</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Budget</label>
                <Select value={plantForm.budget} onChange={update('budget')}>
                  <option value="">Select</option>
                  <option value="low">Keep it cheap</option>
                  <option value="medium">Normal</option>
                  <option value="high">Premium plants OK</option>
                </Select>
              </div>
            </div>
            <div className="ai-form-actions">
              <button type="button" className="btn btn-primary" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? 'Planning...' : 'Get tank ideas'}
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
                        {(plan.result?.plants || []).slice(0, 3).map((p) => p.name).join(', ')
                          || 'Saved tank plan'}
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
              <p className="ai-msg">No past results yet. Get tank ideas, then save to see them here.</p>
            )}
          </aside>
        </div>
        ) : (
        <div className="ai-panel-body ai-panel-body--results">
          <div className="ai-output-col">
            {result?.plants?.length > 0 ? (
              <>
                {design && (
                  <div className="tank-idea">
                    <p className="ai-output-label">New tank idea</p>
                    <p className="tank-idea-lead">
                      A {design.volumeLiters}L {design.theme} layout
                      {design.recommendedFishCount ? ` with about ${design.recommendedFishCount} fish` : ''}.
                    </p>
                    {design.hardscape?.length > 0 && (
                      <ul className="tank-idea-list">
                        {design.hardscape.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    )}
                    {design.zones?.length > 0 && (
                      <ul className="tank-idea-list">
                        {design.zones.map((zone) => (
                          <li key={zone.name}><strong>{zone.name}:</strong> {zone.role}</li>
                        ))}
                      </ul>
                    )}
                    {design.stockingNotes?.[0] && <p className="ai-msg">{design.stockingNotes[0]}</p>}
                  </div>
                )}
                <p className="ai-output-label">Recommended plants</p>
                <div className="suggestion-grid suggestion-grid-plants">
                  {result.plants.map((plant) => (
                    <PlantSuggestionCard key={plant.name} item={plant} />
                  ))}
                </div>
                {result.message && <p className="ai-msg">{result.message}</p>}
                <div className="ai-form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={saveResult}
                    disabled={saving || !!savedId}
                  >
                    {savedId ? 'Saved' : saving ? 'Saving...' : 'Save result'}
                  </button>
                </div>
              </>
            ) : (
              <AdvisorEmptyState icon="🌿" title="No ideas yet" message="Fill the new-tank questions and get plants plus a layout idea." />
            )}
          </div>
        </div>
        )}
      </div>
    </AdvisorPageShell>
  );
}

export default PlantedTankAssistant;
