import { useEffect, useState } from 'react';
import AdvisorPageShell from '../components/ai/AdvisorPageShell';
import SourceTag from '../components/ai/SourceTag';
import { AdvisorEmptyState, PlantSuggestionCard } from '../components/ai/SuggestionCard';
import { enrichPlantList } from '../utils/enrichAiResults';
import Select from '../components/ui/Select';
import { useAdvisorTanks } from '../hooks/useAdvisorTanks';
import { aiService } from '../services/aiService';

const DEFAULT_PLANTS = {
  tankType: 'Planted',
  lighting: 'high',
  co2: 'medium',
  ph: '6.9',
  temperature: '25',
};

function PlantedTankAssistant() {
  const { tanks, tank, selectedTank, setSelectedTank, loading, error, setError } = useAdvisorTanks();
  const [plantForm, setPlantForm] = useState(DEFAULT_PLANTS);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!tank) return;
    const lightingMap = { Planted: 'high', Community: 'medium' };
    const co2Map = { Planted: 'medium', Community: 'none' };
    setPlantForm({
      tankType: tank.tankType || 'Planted',
      lighting: lightingMap[tank.tankType] || 'low',
      co2: co2Map[tank.tankType] || 'none',
      ph: tank.latestPH != null ? String(tank.latestPH) : '7.0',
      temperature: tank.latestTemp != null ? String(tank.latestTemp) : '25',
    });
  }, [tank]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const data = await aiService.analyzePlants(plantForm);
      setResult({ ...data, plants: enrichPlantList(data.plants || []) });
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AdvisorPageShell
      title="Planted Tank Assistant"
      subtitle="Enter lighting and water setup for ML plant recommendations"
      tanks={tanks}
      selectedTank={selectedTank}
      onTankChange={setSelectedTank}
      loading={loading}
      error={error}
      emptyIcon="🌿"
    >
      <div className="ai-card ai-panel ai-page-panel">
        <div className="ai-panel-head">
          <div className="ai-title">🌿 Plant suitability <span className="ai-badge">AI</span></div>
          <SourceTag source={result?.source} />
        </div>
        <div className="ai-panel-body">
          <div className="ai-input-col">
            <p className="ai-panel-hint">Setup parameters for plant matching</p>
            <div className="ai-form-grid">
              <div className="form-group">
                <label className="form-label">Tank type</label>
                <Select value={plantForm.tankType} onChange={(e) => setPlantForm({ ...plantForm, tankType: e.target.value })}>
                  <option value="Planted">Planted</option>
                  <option value="Community">Community</option>
                  <option value="Monster Fish">Monster Fish</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Lighting</label>
                <Select value={plantForm.lighting} onChange={(e) => setPlantForm({ ...plantForm, lighting: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">CO₂</label>
                <Select value={plantForm.co2} onChange={(e) => setPlantForm({ ...plantForm, co2: e.target.value })}>
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">pH</label>
                <input className="form-input" type="number" step="0.1" value={plantForm.ph} onChange={(e) => setPlantForm({ ...plantForm, ph: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Temp (°C)</label>
                <input className="form-input" type="number" step="0.1" value={plantForm.temperature} onChange={(e) => setPlantForm({ ...plantForm, temperature: e.target.value })} />
              </div>
            </div>
            <button type="button" className="btn btn-primary ai-run-btn" onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run ML Analysis'}
            </button>
          </div>
          <div className="ai-output-col">
            {result?.plants?.length > 0 ? (
              <>
                <p className="ai-output-label">Recommended plants</p>
                <div className="suggestion-grid suggestion-grid-plants">
                  {result.plants.map((plant) => (
                    <PlantSuggestionCard key={plant.name} item={plant} />
                  ))}
                </div>
                {result.message && <p className="ai-msg">{result.message}</p>}
              </>
            ) : (
              <AdvisorEmptyState icon="🌿" title="No suggestions yet" message="Enter setup parameters and run ML analysis." />
            )}
          </div>
        </div>
      </div>
    </AdvisorPageShell>
  );
}

export default PlantedTankAssistant;
