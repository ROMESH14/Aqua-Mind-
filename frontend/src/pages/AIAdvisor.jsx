import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { tankService } from '../services/tankService';
import { aiService } from '../services/aiService';

function AIAdvisor() {
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState(null);
  const [species, setSpecies] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [plants, setPlants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    tankService.getAll()
      .then((data) => { setTanks(data); if (data.length) setSelectedTank(data[0].id); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTank) return;
    Promise.all([
      aiService.getSpecies(selectedTank),
      aiService.getPredictions(selectedTank),
      aiService.getPlants(selectedTank),
    ]).then(([sp, pred, pl]) => {
      setSpecies(sp);
      setPredictions(pred);
      setPlants(pl);
    }).catch((err) => setError(err.message));
  }, [selectedTank]);

  const tank = tanks.find((t) => t.id === selectedTank);

  return (
    <div className="page-screen">
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">AI Advisor</div>
            <div className="page-subtitle">Smart recommendations and water quality predictions</div>
          </div>
          {tanks.length > 0 && (
            <select className="form-input" style={{ width: 'auto', minWidth: '200px' }} value={selectedTank || ''} onChange={(e) => setSelectedTank(parseInt(e.target.value, 10))}>
              {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : !tanks.length ? (
          <EmptyState icon="🤖" title="No tanks for AI analysis" message="Add a tank with species and water data to get AI recommendations.">
            <Link to="/tanks" className="btn btn-primary" style={{ marginTop: '12px' }}>Add a Tank</Link>
          </EmptyState>
        ) : (
          <>
            <div className="ai-grid-2">
              <div className="ai-card">
                <div className="ai-title">🤖 Species Advisor <span className="ai-badge">AI</span></div>
                {species?.recommendations?.length > 0 ? (
                  <>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Based on {tank?.name} — {tank?.volumeLiters ? `${tank.volumeLiters}L` : ''}{species.tank?.pH ? `, pH ${species.tank.pH}` : ''}
                    </div>
                    <div className="fish-recommendation">
                      {species.recommendations.map((fish) => (
                        <div key={fish.name} className="fish-rec-card">
                          <div className="fish-emoji">{fish.emoji || '🐟'}</div>
                          <div className="fish-name">{fish.name}</div>
                          <div className="fish-compat">
                            <div className="compat-bar"><div className="compat-fill" style={{ width: `${fish.compat}%` }} /></div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--red-light)' }}>{fish.compat}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {species.warning && (
                      <div style={{ background: 'var(--red-muted)', border: '1px solid rgba(196,30,36,0.25)', borderRadius: '10px', padding: '12px', fontSize: '0.78rem', marginTop: '1rem' }}>
                        <span style={{ color: 'var(--red-light)', fontWeight: 700 }}>⚠ {species.warning}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState icon="🐟" title="No species recommendations" message={species?.message || 'Add fish species to your tank for compatibility advice.'} />
                )}
              </div>

              <div className="ai-card">
                <div className="ai-title">🔮 Water Quality Prediction <span className="ai-badge">ML</span></div>
                {predictions?.predictions?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {predictions.predictions.map((pred) => (
                      <div key={pred.title} className={`ai-prediction-item ${pred.variant}`}>
                        <span style={{ fontSize: '20px' }}>{pred.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{pred.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pred.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="🔮" title="No predictions available" message={predictions?.message || 'Log water parameters over time to enable forecasts.'} />
                )}
              </div>
            </div>

            <div className="ai-card">
              <div className="ai-title">🌿 Planted Tank Assistant <span className="ai-badge">AI</span></div>
              {plants?.plants?.length > 0 ? (
                <div className="plant-grid">
                  {plants.plants.map((plant) => (
                    <div key={plant.name} className="plant-rec-card">
                      <div style={{ fontSize: '26px', marginBottom: '8px' }}>{plant.emoji || '🌱'}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{plant.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--red-light)', marginTop: '4px' }}>{plant.match}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{plant.detail}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🌿" title="No plant suggestions" message={plants?.message || 'Set up a planted tank profile for recommendations.'} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AIAdvisor;
