const equipmentModel = require('../models/equipmentModel');
const tankModel = require('../models/tankModel');

const TYPES = ['Filter', 'Heater', 'Lighting', 'Pump', 'CO2', 'Other'];
const STATUSES = ['Working', 'Needs service', 'Replaced'];

function formatItem(row) {
  return {
    id: row.EquipmentID,
    tankId: row.TankID || null,
    tankName: row.TankName || 'Unassigned',
    name: row.Name,
    type: row.Type,
    brand: row.Brand || '',
    status: row.Status,
    notes: row.Notes || '',
    createdAt: row.CreatedAt,
  };
}

async function resolveTank(userId, tankId) {
  if (!tankId) return true;
  const tank = await tankModel.findById(tankId, userId);
  return Boolean(tank);
}

async function getAll(req, res) {
  const tankId = req.query.tankId ? parseInt(req.query.tankId, 10) : null;
  const rows = await equipmentModel.findByUser(req.user.id, tankId);
  res.json(rows.map(formatItem));
}

async function create(req, res) {
  const { name, type, tankId, brand, status, notes } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required' });
  }
  if (!TYPES.includes(type)) {
    return res.status(400).json({ message: 'Invalid equipment type' });
  }
  const itemStatus = STATUSES.includes(status) ? status : 'Working';
  if (tankId && !(await resolveTank(req.user.id, tankId))) {
    return res.status(404).json({ message: 'Tank not found' });
  }

  const row = await equipmentModel.create(req.user.id, {
    name: String(name).trim(),
    type,
    tankId: tankId || null,
    brand,
    status: itemStatus,
    notes,
  });
  res.status(201).json(formatItem({ ...row, TankName: null }));
}

async function update(req, res) {
  const existing = await equipmentModel.findById(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ message: 'Equipment not found' });

  const { name, type, tankId, brand, status, notes } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required' });
  }
  if (!TYPES.includes(type)) {
    return res.status(400).json({ message: 'Invalid equipment type' });
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  if (tankId && !(await resolveTank(req.user.id, tankId))) {
    return res.status(404).json({ message: 'Tank not found' });
  }

  const row = await equipmentModel.update(req.params.id, req.user.id, {
    name: String(name).trim(),
    type,
    tankId: tankId || null,
    brand,
    status: status || existing.Status,
    notes,
  });
  res.json(formatItem({ ...row, TankName: null }));
}

async function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ message: 'Invalid equipment' });
  const existing = await equipmentModel.findById(id, req.user.id);
  const deleted = await equipmentModel.remove(id, req.user.id);
  if (!existing && !deleted) return res.status(404).json({ message: 'Equipment not found' });
  res.json({ message: 'Item deleted successfully' });
}

module.exports = { getAll, create, update, remove };
