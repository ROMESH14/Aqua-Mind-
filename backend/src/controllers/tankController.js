const tankModel = require('../models/tankModel');
const { evaluateReading } = require('../utils/waterQuality');
const { parseInhabitants, countInhabitants } = require('../utils/tankInhabitants');

function formatTank(tank) {
  const reading = {
    pH: tank.LatestPH,
    Temperature: tank.LatestTemp,
    Ammonia: tank.LatestAmmonia,
  };
  const evalResult = tank.LatestPH != null || tank.LatestAmmonia != null
    ? evaluateReading(reading)
    : { status: 'ok', statusText: 'No readings yet' };
  const fishNames = parseInhabitants(tank.FishNames);
  const plantNames = parseInhabitants(tank.PlantNames);
  const fishCount = tank.FishCount || countInhabitants(fishNames);
  const plantCount = tank.PlantCount || countInhabitants(plantNames);

  return {
    id: tank.TankID,
    name: tank.Name,
    volumeLiters: tank.VolumeLiters,
    tankType: tank.TankType,
    fishCount,
    plantCount,
    fishNames,
    plantNames,
    createdAt: tank.CreatedAt,
    latestPH: tank.LatestPH,
    latestTemp: tank.LatestTemp,
    latestAmmonia: tank.LatestAmmonia,
    status: evalResult.status === 'ok' ? 'ok' : evalResult.status === 'alert' ? 'alert' : 'warn',
    statusText: evalResult.statusText,
    meta: [
      tank.VolumeLiters ? `${tank.VolumeLiters}L` : null,
      tank.TankType,
      !fishNames.length && fishCount ? `${fishCount} fish` : null,
      !plantNames.length && plantCount ? `${plantCount} plants` : null,
    ].filter(Boolean).join(' · '),
  };
}

async function getAll(req, res) {
  const tanks = await tankModel.findByUser(req.user.id);
  res.json(tanks.map(formatTank));
}

async function getOne(req, res) {
  const tank = await tankModel.findById(req.params.id, req.user.id);
  if (!tank) return res.status(404).json({ message: 'Tank not found' });
  res.json(formatTank({ ...tank, LatestPH: null, LatestTemp: null, LatestAmmonia: null }));
}

async function create(req, res) {
  const { name, volumeLiters, tankType, fishNames, plantNames, fishCount, plantCount } = req.body;
  if (!name) return res.status(400).json({ message: 'Tank name is required' });

  const tank = await tankModel.create(req.user.id, {
    name, volumeLiters, tankType, fishNames, plantNames, fishCount, plantCount,
  });
  res.status(201).json(formatTank({ ...tank, LatestPH: null, LatestTemp: null, LatestAmmonia: null }));
}

async function update(req, res) {
  const existing = await tankModel.findById(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ message: 'Tank not found' });

  const tank = await tankModel.update(req.params.id, req.user.id, {
    name: req.body.name ?? existing.Name,
    volumeLiters: req.body.volumeLiters ?? existing.VolumeLiters,
    tankType: req.body.tankType ?? existing.TankType,
    fishNames: req.body.fishNames ?? parseInhabitants(existing.FishNames),
    plantNames: req.body.plantNames ?? parseInhabitants(existing.PlantNames),
    fishCount: req.body.fishCount,
    plantCount: req.body.plantCount,
  });
  res.json(formatTank({ ...tank, LatestPH: null, LatestTemp: null, LatestAmmonia: null }));
}

async function remove(req, res) {
  const deleted = await tankModel.remove(req.params.id, req.user.id);
  if (!deleted) return res.status(404).json({ message: 'Tank not found' });
  res.json({ message: 'Tank deleted' });
}

module.exports = { getAll, getOne, create, update, remove };
