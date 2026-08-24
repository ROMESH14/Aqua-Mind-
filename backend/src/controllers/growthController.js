const growthModel = require('../models/growthModel');
const tankModel = require('../models/tankModel');

function formatRecord(row) {
  return {
    id: row.GrowthID,
    tankId: row.TankID,
    tankName: row.TankName || 'Tank',
    fishName: row.FishName,
    lengthCm: row.LengthCm != null ? Number(row.LengthCm) : null,
    weightG: row.WeightG != null ? Number(row.WeightG) : null,
    notes: row.Notes || '',
    recordedAt: row.RecordedAt,
  };
}

async function getAll(req, res) {
  const tankId = req.query.tankId ? parseInt(req.query.tankId, 10) : null;
  const rows = await growthModel.findByUser(req.user.id, tankId);
  res.json(rows.map(formatRecord));
}

async function create(req, res) {
  const { tankId, fishName, lengthCm, weightG, notes } = req.body;
  if (!tankId || !fishName || lengthCm == null || lengthCm === '') {
    return res.status(400).json({ message: 'Tank, fish name, and length are required' });
  }

  const tank = await tankModel.findById(tankId, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });

  const length = Number(lengthCm);
  if (Number.isNaN(length) || length <= 0) {
    return res.status(400).json({ message: 'Length must be a positive number' });
  }

  const row = await growthModel.create(req.user.id, {
    tankId,
    fishName: String(fishName).trim(),
    lengthCm: length,
    weightG: weightG === '' || weightG == null ? null : Number(weightG),
    notes,
  });
  res.status(201).json(formatRecord({ ...row, TankName: tank.Name }));
}

async function remove(req, res) {
  const deleted = await growthModel.remove(req.params.id, req.user.id);
  if (!deleted) return res.status(404).json({ message: 'Growth record not found' });
  res.json({ message: 'Growth record deleted' });
}

module.exports = { getAll, create, remove };
