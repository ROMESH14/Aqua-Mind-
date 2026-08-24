import { useEffect, useMemo, useState } from 'react';
import PageHero from '../components/ui/PageHero';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { tankService } from '../services/tankService';
import { equipmentService } from '../services/equipmentService';

const TYPES = ['Filter', 'Heater', 'Lighting', 'Pump', 'CO2', 'Other'];
const STATUSES = ['Working', 'Needs service', 'Replaced'];

const emptyForm = { name: '', type: 'Filter', tankId: '', brand: '', status: 'Working', notes: '' };

function Equipment() {
  const [tanks, setTanks] = useState([]);
  const [items, setItems] = useState([]);
  const [tankFilter, setTankFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const load = async (tankId = tankFilter) => {
    try {
      const [tankData, equipment] = await Promise.all([
        tankService.getAll(),
        equipmentService.getAll(tankId || undefined),
      ]);
      setTanks(tankData);
      setItems(equipment);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTankFilter = async (value) => {
    setTankFilter(value);
    try {
      setItems(await equipmentService.getAll(value || undefined));
    } catch (err) {
      setError(err.message);
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    TYPES.forEach((type) => { map[type] = []; });
    items.forEach((item) => {
      const key = TYPES.includes(item.type) ? item.type : 'Other';
      map[key].push(item);
    });
    return map;
  }, [items]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      type: item.type,
      tankId: item.tankId ? String(item.tankId) : '',
      brand: item.brand || '',
      status: item.status,
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      type: form.type,
      tankId: form.tankId ? parseInt(form.tankId, 10) : null,
      brand: form.brand,
      status: form.status,
      notes: form.notes,
    };
    try {
      if (editing) {
        await equipmentService.update(editing.id, payload);
      } else {
        await equipmentService.create(payload);
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      await load(tankFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await equipmentService.remove(id);
      await load(tankFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const statusClass = (status) => {
    if (status === 'Working') return 'ok';
    if (status === 'Needs service') return 'warn';
    return 'alert';
  };

  return (
    <div className="page-screen">
      <div className="page">
        <PageHero eyebrow="Hardware" title="Equipment" subtitle="Track filters, lights, heaters, and other tank gear">
          <Select value={tankFilter} onChange={(e) => handleTankFilter(e.target.value)} aria-label="Filter tank">
            <option value="">All tanks</option>
            {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <button type="button" className="btn btn-primary" onClick={openCreate}>＋ Add equipment</button>
        </PageHero>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {items.length === 0 ? (
          <EmptyState icon="🔧" title="No equipment yet" message="Add filters, heaters, lighting, pumps, or CO2 gear.">
            <button type="button" className="btn btn-primary" style={{ marginTop: '12px' }} onClick={openCreate}>Add first item</button>
          </EmptyState>
        ) : (
          TYPES.filter((type) => grouped[type].length > 0).map((type) => (
            <div key={type} className="equip-section">
              <h2 className="equip-section-title">{type}</h2>
              <div className="equip-grid">
                {grouped[type].map((item) => (
                  <article key={item.id} className="equip-card">
                    <div className="equip-card-top">
                      <div>
                        <h3 className="equip-name">{item.name}</h3>
                        <p className="equip-meta">{item.brand || 'No brand'} · {item.tankName}</p>
                      </div>
                      <span className={`log-badge ${statusClass(item.status)}`}>{item.status}</span>
                    </div>
                    {item.notes && <p className="equip-notes">{item.notes}</p>}
                    <div className="equip-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}

        {showModal && (
          <Modal title={editing ? 'Edit equipment' : 'Add equipment'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tank</label>
                <Select value={form.tankId} onChange={(e) => setForm({ ...form, tankId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input className="form-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" className="auth-btn">{editing ? 'Save changes' : 'Add equipment'}</button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Equipment;
