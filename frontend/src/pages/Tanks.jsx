import { useEffect, useState } from 'react';
import TankCard from '../components/ui/TankCard';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { tankService } from '../services/tankService';
import { mapTankForCard } from '../utils/tankMapper';

function Tanks() {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', volumeLiters: '', tankType: '', fishCount: 0, plantCount: 0 });

  const loadTanks = () => {
    tankService.getAll()
      .then(setTanks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTanks(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tankService.create({
        name: form.name,
        volumeLiters: form.volumeLiters ? parseInt(form.volumeLiters, 10) : null,
        tankType: form.tankType || null,
        fishCount: parseInt(form.fishCount, 10) || 0,
        plantCount: parseInt(form.plantCount, 10) || 0,
      });
      setShowModal(false);
      setForm({ name: '', volumeLiters: '', tankType: '', fishCount: 0, plantCount: 0 });
      loadTanks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-screen">
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">My Tanks</div>
            <div className="page-subtitle">Manage and monitor all your aquariums</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>＋ New Tank</button>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : tanks.length === 0 ? (
          <EmptyState icon="🐠" title="No tanks yet" message="Create your first aquarium to start monitoring.">
            <button type="button" className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => setShowModal(true)}>＋ Create First Tank</button>
          </EmptyState>
        ) : (
          <div className="tanks-grid">
            {tanks.map((tank, i) => (
              <TankCard key={tank.id} tank={mapTankForCard(tank, i)} />
            ))}
          </div>
        )}

        {showModal && (
          <Modal title="New Tank" onClose={() => setShowModal(false)}>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Tank Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Volume (Liters)</label>
                <input className="form-input" type="number" value={form.volumeLiters} onChange={(e) => setForm({ ...form, volumeLiters: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tank Type</label>
                <Select value={form.tankType} onChange={(e) => setForm({ ...form, tankType: e.target.value })}>
                  <option value="">Select type</option>
                  <option value="Community">Community</option>
                  <option value="Planted">Planted</option>
                  <option value="Monster Fish">Monster Fish</option>
                  <option value="Nano">Nano</option>
                </Select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fish Count</label>
                  <input className="form-input" type="number" min="0" value={form.fishCount} onChange={(e) => setForm({ ...form, fishCount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Plant Count</label>
                  <input className="form-input" type="number" min="0" value={form.plantCount} onChange={(e) => setForm({ ...form, plantCount: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="auth-btn">Create Tank</button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Tanks;
