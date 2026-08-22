import { useEffect, useState } from 'react';
import AdvisorPageShell from '../components/ai/AdvisorPageShell';
import SourceTag from '../components/ai/SourceTag';
import { AdvisorEmptyState, FishSuggestionCard } from '../components/ai/SuggestionCard';
import { enrichFishList } from '../utils/enrichAiResults';
import Select from '../components/ui/Select';
import { useAdvisorTanks } from '../hooks/useAdvisorTanks';
import { aiService } from '../services/aiService';

const DEFAULT_FISH = {
  tankType: 'Community',
  volumeLiters: '60',
  ph: '7.0',
  temperature: '25',
  ammonia: '0',
  nitrite: '0',
  nitrate: '10',
};

function SpeciesAdvisor() {
  const { tanks, tank, selectedTank, setSelectedTank, loading, error, setError } = useAdvisorTanks();
  const [fishForm, setFishForm] = useState(DEFAULT_FISH);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!tank) return;
    setFishForm({
      tankType: tank.tankType || 'Community',
      volumeLiters: tank.volumeLiters ? String(tank.volumeLiters) : '60',
      ph: tank.latestPH != null ? String(tank.latestPH) : '7.0',
      temperature: tank.latestTemp != null ? String(tank.latestTemp) : '25',
      ammonia: tank.latestAmmonia != null ? String(tank.latestAmmonia) : '0',
      nitrite: '0',
      nitrate: '10',
    });
  }, [tank]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const data = await aiService.analyzeFish(fishForm);
      setResult({ ...data, recommendations: enrichFishList(data.recommendations || []) });
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AdvisorPageShell
      title="Species Advisor"
      subtitle="Enter tank conditions and get ML fish compatibility scores"
      tanks={tanks}
      selectedTank={selectedTank}
      onTankChange={setSelectedTank}
      loading={loading}
      error={error}
      emptyIcon="🐟"
    >
      <div className="ai-card ai-panel ai-page-panel">
        <div className="ai-panel-head">
          <div className="ai-title">🤖 Fish compatibility <span className="ai-badge">AI</span></div>
          <SourceTag source={result?.source} />
        </div>
        <div className="ai-panel-body">
          <div className="ai-input-col">
            <p className="ai-panel-hint">Tank conditions for species scoring</p>
            <div className="ai-form-grid">
              <div className="form-group">
                <label className="form-label">Tank type</label>
                <Select value={fishForm.tankType} onChange={(e) => setFishForm({ ...fishForm, tankType: e.target.value })}>
                  <option value="Community">Community</option>
                  <option value="Planted">Planted</option>
                  <option value="Monster Fish">Monster Fish</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Volume (L)</label>
                <input className="form-input" type="number" value={fishForm.volumeLiters} onChange={(e) => setFishForm({ ...fishForm, volumeLiters: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">pH</label>
                <input className="form-input" type="number" step="0.1" value={fishForm.ph} onChange={(e) => setFishForm({ ...fishForm, ph: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Temp (°C)</label>
                <input className="form-input" type="number" step="0.1" value={fishForm.temperature} onChange={(e) => setFishForm({ ...fishForm, temperature: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Ammonia (ppm)</label>
                <input className="form-input" type="number" step="0.01" value={fishForm.ammonia} onChange={(e) => setFishForm({ ...fishForm, ammonia: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Nitrate (ppm)</label>
                <input className="form-input" type="number" step="0.1" value={fishForm.nitrate} onChange={(e) => setFishForm({ ...fishForm, nitrate: e.target.value })} />
              </div>
            </div>
            <button type="button" className="btn btn-primary ai-run-btn" onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run ML Analysis'}
            </button>
          </div>
          <div className="ai-output-col">
            {result?.recommendations?.length > 0 ? (
              <>
                <p className="ai-output-label">Top species for {tank?.name}</p>
                <div className="suggestion-grid suggestion-grid-fish">
                  {result.recommendations.map((fish) => (
                    <FishSuggestionCard key={fish.name} item={fish} />
                  ))}
                </div>
                {result.warning && <div className="ai-warning">⚠ {result.warning}</div>}
                {result.message && <p className="ai-msg">{result.message}</p>}
              </>
            ) : (
              <AdvisorEmptyState icon="🐟" title="No results yet" message="Enter parameters and run ML analysis." />
            )}
          </div>
        </div>
      </div>
    </AdvisorPageShell>
  );
}

export default SpeciesAdvisor;
