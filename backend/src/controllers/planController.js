const planModel = require('../models/planModel');

function parseJson(value, fallback) {
  if (value && typeof value === 'object') return value;
  try {
    return JSON.parse(value || '');
  } catch {
    return fallback;
  }
}

function formatPlan(row) {
  return {
    id: row.PlanID,
    kind: row.Kind,
    title: row.Title,
    searchText: row.SearchText || '',
    form: parseJson(row.FormJSON, {}),
    result: parseJson(row.ResultJSON, {}),
    createdAt: row.CreatedAt,
  };
}

async function getAll(req, res) {
  const rows = await planModel.findByUser(req.user.id, req.query.q, req.query.kind);
  res.json(rows.map(formatPlan));
}

async function getOne(req, res) {
  const row = await planModel.findById(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ message: 'Saved plan not found' });
  res.json(formatPlan(row));
}

async function create(req, res) {
  const { title, form, result, kind } = req.body;
  if (!form || !result) {
    return res.status(400).json({ message: 'Form and result are required' });
  }

  const names = [
    ...(result.plants || []).map((p) => p.name),
    ...(result.recommendations || []).map((p) => p.name),
    ...(result.stocking || []).map((p) => p.name),
    ...(result.shoppingList || []).map((p) => p.name),
  ].join(' ');
  const searchText = [
    title,
    form.tankType,
    form.style,
    form.theme,
    form.tankStyle,
    form.tankShape,
    form.lighting,
    names,
  ].filter(Boolean).join(' ');

  const row = await planModel.create(req.user.id, {
    kind: kind || 'plants',
    title: String(title || 'Saved tank plan').trim().slice(0, 120),
    searchText,
    formJson: JSON.stringify(form),
    resultJson: JSON.stringify(result),
  });
  res.status(201).json(formatPlan(row));
}

async function remove(req, res) {
  const deleted = await planModel.remove(req.params.id, req.user.id);
  if (!deleted) return res.status(404).json({ message: 'Saved plan not found' });
  res.json({ message: 'Saved plan deleted' });
}

module.exports = { getAll, getOne, create, remove };
