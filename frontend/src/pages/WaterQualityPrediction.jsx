import { useEffect, useState } from 'react';
import AdvisorPageShell from '../components/ai/AdvisorPageShell';
import SourceTag from '../components/ai/SourceTag';
import { AdvisorEmptyState, WaterInsightCard } from '../components/ai/SuggestionCard';
import { useAdvisorTanks } from '../hooks/useAdvisorTanks';
import { waterService } from '../services/waterService';
import { aiService } from '../services/aiService';

const EMPTY_READING = { pH: '', temperature: '', ammonia: '', nitrite: '', nitrate: '' };

function WaterQualityPrediction() {
  const { tanks, selectedTank, setSelectedTank, loading, error, setError } = useAdvisorTanks();
  const [readings, setReadings] = useState([
    { ...EMPTY_READING },
    { ...EMPTY_READING },
    { ...EMPTY_READING },
  ]);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!selectedTank) return;
    waterService.getHistory(selectedTank)
      .then((history) => {
        if (history.length >= 3) {
          const last3 = history.slice(0, 3).reverse();
          setReadings(last3.map((r) => ({
            pH: r.ph != null ? String(r.ph) : '',
            temperature: r.temp != null ? String(r.temp) : '',
            ammonia: r.nh3 != null ? String(r.nh3) : '',
            nitrite: '',
            nitrate: r.no3 != null ? String(r.no3) : '',
          })));
        }
      })
      .catch(() => {});
  }, [selectedTank]);

  const updateReading = (index, field, value) => {
    setReadings((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      setResult(await aiService.analyzeWater({ readings, tankId: selectedTank }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AdvisorPageShell
      title="Water Quality Prediction"
      subtitle="Enter 3 readings and forecast next water parameters with ML"
      tanks={tanks}
      selectedTank={selectedTank}
      onTankChange={setSelectedTank}
      loading={loading}
      error={error}
      emptyIcon="🔮"
    >
      <div className="ai-card ai-panel ai-page-panel">
        <div className="ai-panel-head">
          <div className="ai-title">🔮 Time-series forecast <span className="ai-badge">ML</span></div>
          <SourceTag source={result?.source} />
        </div>
        <div className="ai-panel-body">
          <div className="ai-input-col">
            <p className="ai-panel-hint">3 readings oldest → newest (pH, temp, ammonia)</p>
            <div className="ai-readings-stack">
              {readings.map((r, i) => (
                <div key={i} className="ai-reading-row">
                  <span className="ai-reading-label">Reading {i + 1}</span>
                  <input className="form-input" placeholder="pH" type="number" step="0.1" value={r.pH} onChange={(e) => updateReading(i, 'pH', e.target.value)} />
                  <input className="form-input" placeholder="°C" type="number" step="0.1" value={r.temperature} onChange={(e) => updateReading(i, 'temperature', e.target.value)} />
                  <input className="form-input" placeholder="NH₃" type="number" step="0.01" value={r.ammonia} onChange={(e) => updateReading(i, 'ammonia', e.target.value)} />
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-primary ai-run-btn" onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? 'Predicting...' : 'Run ML Prediction'}
            </button>
          </div>
          <div className="ai-output-col">
            {result?.predictions?.length > 0 ? (
              <>
                {result.forecasts && (
                  <div className="ai-forecast-row">
                    {result.forecasts.pH != null && <span>pH → {result.forecasts.pH.toFixed(2)}</span>}
                    {result.forecasts.Temperature != null && <span>Temp → {result.forecasts.Temperature.toFixed(1)}°C</span>}
                    {result.forecasts.Ammonia != null && <span>NH₃ → {result.forecasts.Ammonia.toFixed(3)}</span>}
                  </div>
                )}
                <div className="ai-predictions-stack">
                  {result.predictions.map((pred) => (
                    <WaterInsightCard key={pred.title} item={pred} />
                  ))}
                </div>
                {result.message && <p className="ai-msg">{result.message}</p>}
              </>
            ) : (
              <AdvisorEmptyState icon="🔮" title="No predictions yet" message="Fill 3 readings and run ML prediction." />
            )}
          </div>
        </div>
      </div>
    </AdvisorPageShell>
  );
}

export default WaterQualityPrediction;
