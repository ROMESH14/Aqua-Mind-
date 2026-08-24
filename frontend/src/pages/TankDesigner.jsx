import { useState } from 'react';
import AdvisorPageShell from '../components/ai/AdvisorPageShell';
import SourceTag from '../components/ai/SourceTag';
import { AdvisorEmptyState } from '../components/ai/SuggestionCard';
import Select from '../components/ui/Select';
import { aiService } from '../services/aiService';

const SLOT_ICON = {
  plant: '🌿',
  wood: '🪵',
  rock: '🪨',
  sand: '▫',
  open: '💧',
  fish: '🐟',
  filter: '🌀',
  heater: '♨️',
};

function TankDesigner() {
  const [form, setForm] = useState({
    tankType: 'Community',
    volumeLiters: '60',
    theme: 'community',
    lighting: 'medium',
    livestock: 'mixed',
  });
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const runDesign = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const data = await aiService.analyzeDesign({
        ...form,
        volumeLiters: Number(form.volumeLiters) || 60,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AdvisorPageShell
      title="Tank Designer"
      subtitle="Plan a new tank layout — size, theme, and livestock. No existing tank needed."
      error={error}
      emptyIcon="🎨"
    >
      <div className="ai-card ai-panel ai-page-panel">
        <div className="ai-panel-head">
          <div className="ai-title">🎨 Layout planner <span className="ai-badge">AI</span></div>
          <SourceTag source={result?.source} />
        </div>
        <div className="ai-panel-body designer-body">
          <div className="ai-input-col">
            <p className="ai-panel-hint">Tank size, theme, and livestock style</p>
            <div className="ai-form-grid">
              <div className="form-group">
                <label className="form-label">Tank type</label>
                <Select value={form.tankType} onChange={(e) => setForm({ ...form, tankType: e.target.value })}>
                  <option value="Community">Community</option>
                  <option value="Planted">Planted</option>
                  <option value="Monster Fish">Monster Fish</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Volume (L)</label>
                <input className="form-input" type="number" min="10" value={form.volumeLiters} onChange={(e) => setForm({ ...form, volumeLiters: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Theme</label>
                <Select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
                  <option value="community">Community</option>
                  <option value="planted">Planted</option>
                  <option value="nature">Nature</option>
                  <option value="monster">Monster</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Lighting</label>
                <Select value={form.lighting} onChange={(e) => setForm({ ...form, lighting: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Livestock</label>
                <Select value={form.livestock} onChange={(e) => setForm({ ...form, livestock: e.target.value })}>
                  <option value="mixed">Mixed community</option>
                  <option value="schooling">Schooling</option>
                  <option value="predator">Predator / monster</option>
                </Select>
              </div>
            </div>
            <button type="button" className="btn btn-primary ai-run-btn" onClick={runDesign} disabled={analyzing}>
              {analyzing ? 'Designing...' : 'Generate layout'}
            </button>
          </div>

          <div className="ai-output-col">
            {result?.layoutSlots?.length ? (
              <>
                <div className="designer-tank" aria-label="Tank layout mockup">
                  {result.layoutSlots.map((slot, i) => (
                    <div key={`${slot.label}-${i}`} className={`designer-slot designer-slot-${slot.type}`}>
                      <span className="designer-slot-icon">{SLOT_ICON[slot.type] || '•'}</span>
                      <span>{slot.label}</span>
                    </div>
                  ))}
                </div>
                <p className="ai-output-label">About {result.volumeLiters}L · {result.theme} · ~{result.recommendedFishCount} fish</p>
                {result.message && <p className="ai-msg">{result.message}</p>}
              </>
            ) : (
              <AdvisorEmptyState icon="🎨" title="No layout yet" message="Set tank size and theme, then generate a visual plan." />
            )}
          </div>
        </div>

        {result && (
          <div className="designer-plan">
            <div>
              <h3>Zones</h3>
              <ul>
                {result.zones.map((zone) => (
                  <li key={zone.name}><strong>{zone.name}:</strong> {zone.role} ({zone.coverage})</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Hardscape</h3>
              <ul>
                {result.hardscape.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h3>Stocking notes</h3>
              <ul>
                {result.stockingNotes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
            <div>
              <h3>Suggested plants</h3>
              <ul>
                {(result.plants || []).map((plant) => <li key={plant.name}>{plant.name}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AdvisorPageShell>
  );
}

export default TankDesigner;
