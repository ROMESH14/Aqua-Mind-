import { useEffect, useState } from 'react';
import TankCard from '../components/ui/TankCard';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import SpeciesTagInput from '../components/ui/SpeciesTagInput';
import { tankService } from '../services/tankService';
import { mapTankForCard } from '../utils/tankMapper';
import PageHero from '../components/ui/PageHero';
import { ALL_FISH_NAMES, fishNamesForTank } from '../data/fishRoster';
import { FISH_PROFILES, PLANT_PROFILES } from '../data/aiCatalog';

const EMPTY_FORM = {
  name: '',
  volumeLiters: '',
  tankType: '',
  fish: [],
  plants: [],
};

const CATALOG_FISH = [...new Set([...ALL_FISH_NAMES, ...Object.keys(FISH_PROFILES)])].sort();
const ALL_PLANT_NAMES = Object.keys(PLANT_PROFILES);
const QUICK_FISH = ['Neon Tetra', 'Guppy', 'Betta', 'Corydoras', 'Cherry Shrimp', 'Angelfish'];
const QUICK_PLANTS = ['Java Fern', 'Anubias', 'Amazon Sword', 'Java Moss', 'Vallisneria'];

function Tanks() {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const loadTanks = () => {
    tankService.getAll()
      .then(setTanks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTanks(); }, []);

  const handleDelete = (tank) => setPendingDelete(tank);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await tankService.remove(pendingDelete.id);
      setPendingDelete(null);
      loadTanks();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (tank) => {
    setEditingId(tank.id);
    setForm({
      name: tank.name || '',
      volumeLiters: tank.volumeLiters != null ? String(tank.volumeLiters) : '',
      tankType: tank.tankType || '',
      fish: Array.isArray(tank.fishNames) ? tank.fishNames : [],
      plants: Array.isArray(tank.plantNames) ? tank.plantNames : [],
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      volumeLiters: form.volumeLiters ? parseInt(form.volumeLiters, 10) : null,
      tankType: form.tankType || null,
      fishNames: form.fish,
      plantNames: form.plants,
    };
    try {
      if (editingId) {
        await tankService.update(editingId, payload);
      } else {
        await tankService.create(payload);
      }
      closeForm();
      loadTanks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fishSuggestions = form.tankType
    ? [...new Set([...fishNamesForTank(form.tankType), ...Object.keys(FISH_PROFILES)])]
    : CATALOG_FISH;

  return (
    <div className="page-screen">
      <div className="page">
        <PageHero eyebrow="Collection" title="My Tanks" subtitle="Manage and monitor all your aquariums">
          <button type="button" className="btn btn-primary" onClick={openCreate}>＋ New Tank</button>
        </PageHero>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : tanks.length === 0 ? (
          <EmptyState icon="🐠" title="No tanks yet" message="Create your first aquarium to start monitoring.">
            <button type="button" className="btn btn-primary" style={{ marginTop: '12px' }} onClick={openCreate}>＋ Create First Tank</button>
          </EmptyState>
        ) : (
          <div className="tanks-grid">
            {tanks.map((tank, i) => (
              <TankCard
                key={tank.id}
                tank={mapTankForCard(tank, i)}
                onEdit={() => openEdit(tank)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {showModal && (
          <Modal title={editingId ? 'Edit Tank' : 'New Tank'} wide onClose={closeForm}>
            <form onSubmit={handleSave}>
              <p className="form-intro">Tell us who lives here. Water tests like pH, temperature, and ammonia can be logged later on the Water page.</p>
              <div className="form-group">
                <label className="form-label">Tank Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  placeholder="Living room community"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Volume (Liters)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    placeholder="60"
                    value={form.volumeLiters}
                    onChange={(e) => setForm({ ...form, volumeLiters: e.target.value })}
                  />
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
              </div>
              <SpeciesTagInput
                label="What fish live here?"
                hint="Add each species by name. Type your own or pick a suggestion."
                placeholder="e.g. Neon Tetra"
                suggestions={fishSuggestions}
                quickPicks={QUICK_FISH}
                items={form.fish}
                onChange={(fish) => setForm({ ...form, fish })}
              />
              <SpeciesTagInput
                label="What plants grow here?"
                hint="List the plants in this tank. Skip this if it is fish-only."
                placeholder="e.g. Java Fern"
                suggestions={ALL_PLANT_NAMES}
                quickPicks={QUICK_PLANTS}
                items={form.plants}
                onChange={(plants) => setForm({ ...form, plants })}
              />
              <button type="submit" className="auth-btn" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create Tank'}
              </button>
            </form>
          </Modal>
        )}

        {pendingDelete && (
          <Modal title="Delete tank" onClose={() => !deleting && setPendingDelete(null)}>
            <div className="confirm-body">
              <p className="confirm-text">
                Remove <strong>{pendingDelete.name}</strong> from your collection?
              </p>
              <p className="confirm-hint">Water logs and growth records for this tank will also be removed. This cannot be undone.</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-ghost" disabled={deleting} onClick={() => setPendingDelete(null)}>
                  Keep tank
                </button>
                <button type="button" className="btn btn-danger" disabled={deleting} onClick={confirmDelete}>
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Tanks;
