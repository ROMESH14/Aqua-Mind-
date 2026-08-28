import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import Select from '../components/ui/Select';
import { tankService } from '../services/tankService';
import { equipmentService } from '../services/equipmentService';

const TYPES = ['Filter', 'Heater', 'Lighting', 'Pump', 'CO2', 'Other'];
const STATUSES = ['Working', 'Needs service', 'Replaced'];

const FIELDS = {
  Filter: [
    { key: 'watts', label: 'Watts', suffix: 'W' },
    { key: 'flow', label: 'Flow', suffix: 'L/h' },
  ],
  Heater: [{ key: 'watts', label: 'Watts', suffix: 'W' }],
  Lighting: [{ key: 'watts', label: 'Watts', suffix: 'W' }],
  Pump: [
    { key: 'watts', label: 'Watts', suffix: 'W' },
    { key: 'flow', label: 'Flow', suffix: 'L/h' },
  ],
  CO2: [{ key: 'extra', label: 'Detail', suffix: '' }],
  Other: [{ key: 'extra', label: 'Detail', suffix: '' }],
};

const EMPTY_DETAILS = { qty: '1', watts: '', flow: '', extra: '', image: '' };

function fileToDataUrl(file, max = 320) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}

function statusClass(status) {
  if (status === 'Working') return 'ok';
  if (status === 'Needs service') return 'warn';
  return 'alert';
}

function parseDetails(notes) {
  if (!notes) return { ...EMPTY_DETAILS };
  try {
    const data = JSON.parse(notes);
    if (data && typeof data === 'object') {
      return {
        qty: data.qty != null && data.qty !== '' ? String(data.qty) : '1',
        watts: data.watts != null ? String(data.watts) : '',
        flow: data.flow != null ? String(data.flow) : '',
        extra: data.extra != null ? String(data.extra) : '',
        image: data.image || '',
      };
    }
  } catch {
    return { ...EMPTY_DETAILS, extra: notes };
  }
  return { ...EMPTY_DETAILS, extra: notes };
}

function packDetails(details) {
  return JSON.stringify({
    v: 1,
    qty: normalizeQty(details.qty),
    watts: details.watts || '',
    flow: details.flow || '',
    extra: details.extra || '',
    image: details.image || '',
  });
}

function normalizeQty(value) {
  const qty = parseInt(value, 10);
  return Number.isFinite(qty) && qty > 0 ? String(qty) : '1';
}

function factChips(details, brand) {
  const chips = [{ label: 'Qty', value: normalizeQty(details.qty) }];
  if (details.watts) chips.push({ label: 'Power', value: `${details.watts} W` });
  if (details.flow) chips.push({ label: 'Flow', value: `${details.flow} L/h` });
  if (details.extra) chips.push({ label: 'Note', value: details.extra });
  if (brand) chips.push({ label: 'Brand', value: brand });
  return chips;
}

function Equipment() {
  const [tanks, setTanks] = useState([]);
  const [items, setItems] = useState([]);
  const [tankId, setTankId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [adding, setAdding] = useState(null);
  const [addForm, setAddForm] = useState({ name: '', brand: '', ...EMPTY_DETAILS });
  const [openId, setOpenId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', brand: '', ...EMPTY_DETAILS });

  const visibleTanks = tankId ? tanks.filter((item) => String(item.id) === String(tankId)) : tanks;
  const serviceCount = items.filter((item) => item.status === 'Needs service').length;

  const load = async (nextTankId) => {
    try {
      const [tankData, equipment] = await Promise.all([
        tankService.getAll(),
        equipmentService.getAll(),
      ]);
      setTanks(tankData);
      setItems(equipment);
      if (nextTankId) setTankId(String(nextTankId));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const startAdd = (tank, type) => {
    setAdding({ tankId: tank.id, type });
    setAddForm({ name: type === 'Other' ? '' : type, brand: '', ...EMPTY_DETAILS });
    setOpenId(null);
    setError('');
  };

  const saveNew = async (e) => {
    e.preventDefault();
    if (!adding) return;
    const name = (addForm.name || adding.type).trim();
    if (!name) {
      setError('Type a name for this item.');
      return;
    }
    setBusy('add');
    setError('');
    try {
      await equipmentService.create({
        name,
        type: adding.type,
        tankId: adding.tankId,
        brand: addForm.brand,
        status: 'Working',
        notes: packDetails(addForm),
      });
      setAdding(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const openItem = (item) => {
    const details = parseDetails(item.notes);
    setOpenId(item.id);
    setEditForm({ name: item.name, brand: item.brand || '', ...details });
  };

  const saveItem = async (item, extra = {}) => {
    const details = extra.details || editForm;
    const status = extra.status || item.status;
    const nextName = String(extra.name || editForm.name || item.name || item.type || '').trim();
    if (!nextName) {
      setError('Give this item a name.');
      return false;
    }
    setBusy(`save-${item.id}`);
    setError('');
    try {
      await equipmentService.update(item.id, {
        name: nextName,
        type: item.type,
        tankId: item.tankId,
        brand: extra.brand != null ? extra.brand : editForm.brand,
        notes: packDetails(details),
        status,
      });
      await load();
      if (extra.close) setOpenId(null);
      return true;
    } catch (err) {
      setError(err.message || 'Could not save details.');
      return false;
    } finally {
      setBusy('');
    }
  };

  const changeStatus = async (item, status) => {
    const details = openId === item.id ? editForm : parseDetails(item.notes);
    await saveItem(item, {
      status,
      details,
      name: openId === item.id ? editForm.name : item.name,
      brand: openId === item.id ? editForm.brand : item.brand,
    });
  };

  const removeItem = async (id) => {
    setBusy(`del-${id}`);
    setError('');
    setNotice('');
    try {
      await equipmentService.remove(id);
      if (openId === id) setOpenId(null);
      setItems((current) => current.filter((item) => item.id !== id));
      setNotice('Item deleted successfully');
      await load();
    } catch (err) {
      if (/not found/i.test(err.message || '')) {
        if (openId === id) setOpenId(null);
        setItems((current) => current.filter((item) => item.id !== id));
        setNotice('Item deleted successfully');
      } else {
        setError(err.message);
      }
    } finally {
      setBusy('');
    }
  };

  const setPhoto = async (file, setForm) => {
    if (!file) return;
    try {
      const image = await fileToDataUrl(file);
      setForm((current) => ({ ...current, image }));
    } catch (err) {
      setError(err.message);
    }
  };

  const renderFields = (form, setForm, type) => (
    <div className="eq-detail-fields">
      <label className="eq-photo">
        {form.image ? <img src={form.image} alt="" /> : <span>Add photo</span>}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPhoto(file, setForm);
            e.target.value = '';
          }}
        />
      </label>
      {form.image && (
        <button type="button" className="eq-remove" onClick={() => setForm({ ...form, image: '' })}>
          Clear photo
        </button>
      )}
      {type === 'Other' && (
        <label className="eq-field eq-field-wide">
          <span>Item name</span>
          <input
            className="form-input"
            value={form.name}
            placeholder="Air stone, UV, skimmer…"
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
      )}
      <label className="eq-field">
        <span>Quantity</span>
        <input
          className="form-input"
          type="number"
          min="1"
          max="20"
          step="1"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
        />
      </label>
      {(FIELDS[type] || []).map((field) => (
        <label key={field.key} className="eq-field">
          <span>{field.label}{field.suffix ? ` (${field.suffix})` : ''}</span>
          <input
            className="form-input"
            value={form[field.key]}
            placeholder={field.suffix || 'Optional'}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
          />
        </label>
      ))}
      <label className="eq-field">
        <span>Brand</span>
        <input
          className="form-input"
          value={form.brand}
          placeholder="Optional"
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />
      </label>
    </div>
  );

  return (
    <div className="page-screen">
      <div className="page eq-page">
        <PageHero eyebrow="Hardware" title="Equipment" subtitle="Every tank on one page. Tap a type to add gear.">
          {tanks.length > 0 && (
            <Select
              variant="header"
              value={tankId}
              onChange={(e) => { setTankId(e.target.value); setAdding(null); setOpenId(null); }}
              aria-label="Filter tank"
            >
              <option value="">All tanks</option>
              {tanks.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Select>
          )}
        </PageHero>

        {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
        {notice && <div className="form-success" style={{ marginBottom: '12px' }}>{notice}</div>}

        {!tanks.length ? (
          <div className="card eq-simple">
            <h2>Add a tank first</h2>
            <p>Then come back and tap the gear on that tank.</p>
            <Link to="/tanks" className="btn btn-primary">Go to My Tanks</Link>
          </div>
        ) : (
          <>
            <div className="eq-stats">
              <div className="eq-stat">
                <strong>{tanks.length}</strong>
                <span>Tanks</span>
              </div>
              <div className="eq-stat">
                <strong>{items.length}</strong>
                <span>Gear items</span>
              </div>
              <div className="eq-stat">
                <strong>{serviceCount}</strong>
                <span>Need service</span>
              </div>
            </div>

            <div className="eq-board">
              {visibleTanks.map((tank) => {
                const tankItems = items.filter((item) => String(item.tankId) === String(tank.id));
                const isAdding = adding && String(adding.tankId) === String(tank.id);
                return (
                  <article key={tank.id} className="card eq-simple">
                    <p className="eq-kicker">{tank.meta || 'Tank'}</p>
                    <h2>{tank.name}</h2>
                    <p className="eq-help">{tankItems.length} item{tankItems.length === 1 ? '' : 's'} on this tank</p>

                    <div className="eq-add">
                      {TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`eq-add-btn${isAdding && adding.type === type ? ' is-on' : ''}`}
                          onClick={() => startAdd(tank, type)}
                        >
                          + {type}
                        </button>
                      ))}
                    </div>

                    {isAdding && (
                      <form className="eq-add-panel" onSubmit={saveNew}>
                        <p className="eq-kicker">New {adding.type}</p>
                        {renderFields(addForm, setAddForm, adding.type)}
                        <div className="eq-form-actions">
                          <button type="submit" className="btn btn-primary" disabled={busy === 'add'}>
                            {busy === 'add' ? 'Adding…' : `Add ${adding.type}`}
                          </button>
                          <button type="button" className="btn btn-ghost" onClick={() => setAdding(null)}>Cancel</button>
                        </div>
                      </form>
                    )}

                    {tankItems.length ? (
                      <ul className="eq-simple-list">
                        {tankItems.map((item) => {
                          const details = parseDetails(item.notes);
                          const facts = factChips(details, item.brand);
                          const open = openId === item.id;
                          return (
                            <li key={item.id} className={`eq-row${open ? ' is-open' : ''}`}>
                              <div className="eq-row-top">
                                {details.image ? (
                                  <img className="eq-thumb" src={details.image} alt={item.name} />
                                ) : (
                                  <span className="eq-thumb eq-thumb-empty">No photo</span>
                                )}
                                <div className="eq-item-main">
                                  <strong>{item.name}</strong>
                                  <span className="eq-facts">
                                    {facts.map((fact) => (
                                      <span key={fact.label} className="eq-fact">
                                        <em>{fact.label}</em> {fact.value}
                                      </span>
                                    ))}
                                  </span>
                                </div>
                                <Select
                                  className={`eq-status-select eq-status-${statusClass(item.status)}`}
                                  value={item.status}
                                  onChange={(e) => changeStatus(item, e.target.value)}
                                  aria-label={`${item.name} status`}
                                >
                                  {STATUSES.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </Select>
                                <div className="eq-row-actions">
                                  <button
                                    type="button"
                                    className="eq-edit"
                                    onClick={() => (open ? setOpenId(null) : openItem(item))}
                                  >
                                    {open ? 'Close' : 'Edit'}
                                  </button>
                                  <button type="button" className="eq-remove" onClick={() => removeItem(item.id)}>Remove</button>
                                </div>
                              </div>
                              {open && (
                                <div className="eq-edit-panel">
                                  {renderFields(editForm, setEditForm, item.type)}
                                  <div className="eq-form-actions">
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      disabled={busy === `save-${item.id}`}
                                      onClick={() => saveItem(item, { close: true })}
                                    >
                                      {busy === `save-${item.id}` ? 'Saving…' : 'Save details'}
                                    </button>
                                    <button type="button" className="btn btn-ghost" onClick={() => setOpenId(null)}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="eq-help">Nothing on this tank yet.</p>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Equipment;
