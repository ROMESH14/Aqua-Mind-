import { useEffect, useState } from 'react';
import AdvisorPageShell from '../components/ai/AdvisorPageShell';
import SourceTag from '../components/ai/SourceTag';
import { AdvisorEmptyState, FishSuggestionCard, PlantSuggestionCard } from '../components/ai/SuggestionCard';
import { enrichFishList, enrichPlantList } from '../utils/enrichAiResults';
import { scenePhoto, setupFromKit } from '../data/tankScenes';
import Select from '../components/ui/Select';
import { aiService } from '../services/aiService';
import { planService } from '../services/planService';

const DEFAULT_FORM = {
  tankType: '',
  volumeLiters: '',
  tankStyle: '',
  tankShape: '',
  theme: '',
  lighting: '',
  livestock: '',
  substrate: '',
  hardscape: '',
  co2: '',
  experience: '',
  ph: '',
  temperature: '',
  background: '',
};

function formIncomplete(form) {
  return Object.values(form).some((value) => String(value ?? '').trim() === '');
}

const SUBSTRATE_LABEL = { 'aqua-soil': 'Aqua soil', sand: 'Sand', gravel: 'Gravel' };
const HARDSCAPE_LABEL = { none: 'No hardscape', wood: 'Driftwood', rock: 'Rocks', 'wood-rock': 'Wood and rocks' };
const BACKGROUND_LABEL = { plain: 'Plain background', black: 'Black film', image: 'Printed scene' };
const TYPE_LABEL = { Community: 'Community', Planted: 'Planted', 'Monster Fish': 'Monster fish' };
const THEME_LABEL = { community: 'Community theme', planted: 'Planted theme', nature: 'Nature theme', monster: 'Monster theme' };
const LIVESTOCK_LABEL = { mixed: 'Mixed community', schooling: 'Schooling', predator: 'Predator / monster' };
const EXPERIENCE_LABEL = { beginner: 'Beginner', intermediate: 'Some experience', advanced: 'Advanced' };

function TankScene({ form = DEFAULT_FORM, fish = [], plants = [], shoppingList = [] }) {
  const setup = setupFromKit(form, shoppingList);
  const shape = setup.tankShape || 'rectangle';
  const style = setup.tankStyle === 'cement' ? 'cement' : 'glass';
  const hardscape = setup.hardscape || 'none';
  const photo = scenePhoto(setup, plants, fish, shoppingList);
  const caption = [
    TYPE_LABEL[setup.tankType] || setup.tankType,
    THEME_LABEL[setup.theme] || setup.theme,
    LIVESTOCK_LABEL[setup.livestock] || setup.livestock,
    EXPERIENCE_LABEL[setup.experience] || setup.experience,
    style === 'cement' ? 'Cement' : 'Glass',
    shape,
    SUBSTRATE_LABEL[setup.substrate] || setup.substrate,
    HARDSCAPE_LABEL[hardscape] || hardscape,
    BACKGROUND_LABEL[setup.background] || setup.background,
    setup.co2 === 'none' ? 'No CO₂' : `${setup.co2} CO₂`,
  ].filter(Boolean).join(' · ');

  return (
    <div className={`aq-preview aq-preview-${shape}`} aria-label="Tank layout preview">
      <div className={`aq-preview-frame aq-preview-${style}`}>
        <img className="aq-preview-photo" src={photo} alt={caption} />
      </div>
      {(fish.length > 0 || plants.length > 0) && (
        <div className="aq-preview-species">
          {fish.map((item) => (
            <div key={item.name} className="aq-preview-chip">
              <img src={item.image || item.images?.[0] || '/deck-fish.png'} alt="" />
              <span>{item.name}</span>
            </div>
          ))}
          {plants.map((item) => (
            <div key={item.name} className="aq-preview-chip aq-preview-chip-plant">
              <img src={item.image || item.images?.[0] || '/deck-plants.png'} alt="" />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
      <p className="tank-scene-caption">{caption}</p>
      <p className="tank-scene-warning">This picture is only a rough idea of the tank so you can picture the layout. It does not match the actual recommended fish and plants.</p>
    </div>
  );
}

function hydrateDesign(data = {}) {
  return {
    ...data,
    plants: enrichPlantList(data.plants || []),
    stocking: enrichFishList(data.stocking || []),
  };
}

function TankDesigner() {
  const [form, setForm] = useState(DEFAULT_FORM);
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
      setHistory(await planService.list(query, 'designer'));
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory('');
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const runDesign = async () => {
    if (formIncomplete(form)) {
      setError('Fill every field so the layout matches the tank you want.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const data = await aiService.analyzeDesign({
        ...form,
        volumeLiters: Number(form.volumeLiters) || 60,
      });
      setResult(hydrateDesign(data));
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
      const style = result.tankStyle || form.tankStyle;
      const shape = result.tankShape || form.tankShape;
      const saved = await planService.save({
        kind: 'designer',
        title: `${form.volumeLiters}L ${style} ${shape} tank`,
        form,
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
    if (plan.form) setForm({ ...DEFAULT_FORM, ...plan.form });
    setResult(hydrateDesign(plan.result));
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

  const saveButton = (
    <button type="button" className="btn btn-primary btn-sm" onClick={saveResult} disabled={saving || !result || !!savedId}>
      {savedId ? 'Saved' : saving ? 'Saving...' : 'Save layout'}
    </button>
  );

  const historyPanel = (
    <aside className="plan-history-panel">
      <div className="plan-history-tabs">
        <span className="plan-history-tab is-active">Saved layouts</span>
      </div>
      <input
        className="form-input"
        type="search"
        placeholder="Search saved tanks..."
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
                  {[
                    ...(plan.result?.stocking || []).map((item) => item.name),
                    ...(plan.result?.plants || []).map((item) => item.name),
                  ].slice(0, 3).join(', ') || 'Saved tank layout'}
                </em>
                <span>{plan.createdAt ? new Date(plan.createdAt).toLocaleString() : 'Saved locally'}</span>
              </button>
              <button type="button" className="plan-history-delete" onClick={(e) => deleteSaved(e, plan.id)} aria-label="Delete saved layout">
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ai-msg">No saved layouts yet. Generate a tank, then save to see it here.</p>
      )}
    </aside>
  );

  const kitGroups = ['Hardware', 'Setup', 'Plants', 'Fish'];

  return (
    <AdvisorPageShell
      title="Tank Designer"
      subtitle="Fill in the tank details, then generate a layout with a matching picture."
      error={error}
      emptyIcon="🎨"
    >
      <div className="ai-card ai-panel ai-page-panel">
        <div className="ai-panel-head">
          <div className="ai-title">
            {showResults ? '🎨 Your tank layout' : '🎨 Layout planner'}
            <span className="ai-badge">AI</span>
          </div>
          {showResults ? (
            <div className="ai-head-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeResults}>← Edit answers</button>
              {saveButton}
              <button type="button" className="plan-close-btn" onClick={closeResults} aria-label="Close results">✕</button>
            </div>
          ) : (
            <SourceTag source={result?.source} />
          )}
        </div>

        {!showResults ? (
          <div className="ai-panel-body ai-panel-body--form">
            <div className="ai-input-col">
              <p className="ai-panel-hint">Answer the setup questions first. The realistic tank picture appears after you click Generate layout.</p>
              <div className="ai-form-grid">
                <div className="form-group">
                  <label className="form-label">Tank type</label>
                  <Select value={form.tankType} onChange={update('tankType')}>
                    <option value="">Select</option>
                    <option value="Community">Community</option>
                    <option value="Planted">Planted</option>
                    <option value="Monster Fish">Monster Fish</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Volume (L)</label>
                  <input className="form-input" type="number" min="10" placeholder="e.g. 60" value={form.volumeLiters} onChange={update('volumeLiters')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tank style</label>
                  <Select value={form.tankStyle} onChange={update('tankStyle')}>
                    <option value="">Select</option>
                    <option value="glass">Glass</option>
                    <option value="cement">Cement / concrete</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tank shape</label>
                  <Select value={form.tankShape} onChange={update('tankShape')}>
                    <option value="">Select</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="cube">Cube</option>
                    <option value="bowfront">Bowfront</option>
                    <option value="cylinder">Cylinder</option>
                    <option value="hexagon">Hexagon</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <Select value={form.theme} onChange={update('theme')}>
                    <option value="">Select</option>
                    <option value="community">Community</option>
                    <option value="planted">Planted</option>
                    <option value="nature">Nature</option>
                    <option value="monster">Monster</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lighting</label>
                  <Select value={form.lighting} onChange={update('lighting')}>
                    <option value="">Select</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Livestock</label>
                  <Select value={form.livestock} onChange={update('livestock')}>
                    <option value="">Select</option>
                    <option value="mixed">Mixed community</option>
                    <option value="schooling">Schooling</option>
                    <option value="predator">Predator / monster</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Your experience</label>
                  <Select value={form.experience} onChange={update('experience')}>
                    <option value="">Select</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Some experience</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Substrate</label>
                  <Select value={form.substrate} onChange={update('substrate')}>
                    <option value="">Select</option>
                    <option value="aqua-soil">Aqua soil</option>
                    <option value="sand">Sand</option>
                    <option value="gravel">Gravel</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hardscape</label>
                  <Select value={form.hardscape} onChange={update('hardscape')}>
                    <option value="">Select</option>
                    <option value="none">None yet</option>
                    <option value="wood">Driftwood</option>
                    <option value="rock">Rocks</option>
                    <option value="wood-rock">Wood and rocks</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">CO₂</label>
                  <Select value={form.co2} onChange={update('co2')}>
                    <option value="">Select</option>
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Background</label>
                  <Select value={form.background} onChange={update('background')}>
                    <option value="">Select</option>
                    <option value="plain">Plain / none</option>
                    <option value="black">Black film</option>
                    <option value="image">Printed scene</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target pH</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 6.8" value={form.ph} onChange={update('ph')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target temp (°C)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 25" value={form.temperature} onChange={update('temperature')} />
                </div>
              </div>
              <div className="ai-form-actions">
                <button type="button" className="btn btn-primary" onClick={runDesign} disabled={analyzing}>
                  {analyzing ? 'Designing...' : 'Generate layout'}
                </button>
              </div>
            </div>
            {historyPanel}
          </div>
        ) : (
          <div className="ai-panel-body ai-panel-body--results">
            {result ? (
              <div className="ai-output-col">
                <TankScene
                  form={{
                    ...form,
                    theme: result.theme || form.theme,
                    tankStyle: result.tankStyle || form.tankStyle,
                    tankShape: result.tankShape || form.tankShape,
                  }}
                  fish={result.stocking}
                  plants={result.plants}
                  shoppingList={result.shoppingList}
                />
                <p className="ai-output-label">What you need to build this tank</p>
                <div className="designer-kit">
                  {kitGroups.map((group) => {
                    const items = (result.shoppingList || []).filter((item) => item.group === group);
                    if (!items.length) return null;
                    return (
                      <div key={group} className="designer-kit-group">
                        <h3>{group}</h3>
                        <ul>
                          {items.map((item) => (
                            <li key={`${group}-${item.name}`}>
                              <strong>{item.name}</strong>
                              <span>{item.detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <p className="ai-output-label">Best-matching fish</p>
                <p className="ai-panel-hint">At least two fish types (one if the tank is under 3 L). Shrimp can be added after that, but a tank is never shrimp-only.</p>
                <div className="suggestion-grid suggestion-grid-plants">
                  {(result.stocking || []).map((fish) => (
                    <FishSuggestionCard key={fish.name} item={fish} />
                  ))}
                </div>
                <p className="ai-output-label" style={{ marginTop: '1.25rem' }}>Plants that work with these fish</p>
                <p className="ai-panel-hint">Chosen after the fish list, so they share water needs and can survive those species.</p>
                <div className="suggestion-grid suggestion-grid-plants">
                  {(result.plants || []).map((plant) => (
                    <PlantSuggestionCard key={plant.name} item={plant} />
                  ))}
                </div>
                {result.message && <p className="ai-msg">{result.message}</p>}
                <div className="ai-form-actions">
                  {saveButton}
                </div>
                {historyPanel}
              </div>
            ) : (
              <AdvisorEmptyState icon="🎨" title="No layout yet" message="Fill the questions and generate a plan." />
            )}
          </div>
        )}
      </div>
    </AdvisorPageShell>
  );
}

export default TankDesigner;
