const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute } = require('../config/dbHelpers');
const { serializeInhabitants, countInhabitants } = require('../utils/tankInhabitants');

function tankPayload(data) {
  const fishNames = serializeInhabitants(data.fishNames);
  const plantNames = serializeInhabitants(data.plantNames);
  const fishCount = countInhabitants(data.fishNames) || data.fishCount || 0;
  const plantCount = countInhabitants(data.plantNames) || data.plantCount || 0;
  return {
    name: data.name,
    volumeLiters: data.volumeLiters || null,
    tankType: data.tankType || null,
    fishCount: fishCount || 0,
    plantCount: plantCount || 0,
    fishNames,
    plantNames,
  };
}

const listSql = `
  SELECT t.*,
    (SELECT wr.pH FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC LIMIT 1) AS LatestPH,
    (SELECT wr.Temperature FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC LIMIT 1) AS LatestTemp,
    (SELECT wr.Ammonia FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC LIMIT 1) AS LatestAmmonia
  FROM Tanks t WHERE t.UserID = ? ORDER BY t.CreatedAt DESC
`;

async function findByUser(userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryAll(conn, listSql, [userId]);
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).query(`
    SELECT t.*,
      (SELECT TOP 1 wr.pH FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC) AS LatestPH,
      (SELECT TOP 1 wr.Temperature FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC) AS LatestTemp,
      (SELECT TOP 1 wr.Ammonia FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC) AS LatestAmmonia
    FROM Tanks t WHERE t.UserID = @userId ORDER BY t.CreatedAt DESC`);
  return result.recordset;
}

async function findById(tankId, userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT * FROM Tanks WHERE TankID = ? AND UserID = ?', [tankId, userId]);
  }
  const result = await conn.pool.request().input('tankId', conn.sql.Int, tankId).input('userId', conn.sql.Int, userId)
    .query('SELECT * FROM Tanks WHERE TankID = @tankId AND UserID = @userId');
  return result.recordset[0];
}

async function create(userId, data) {
  const conn = await getPool();
  const payload = tankPayload(data);
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(
      conn,
      'INSERT INTO Tanks (UserID, Name, VolumeLiters, TankType, FishCount, PlantCount, FishNames, PlantNames) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, payload.name, payload.volumeLiters, payload.tankType, payload.fishCount, payload.plantCount, payload.fishNames, payload.plantNames]
    );
    return queryOne(conn, 'SELECT * FROM Tanks WHERE TankID = ?', [info.lastInsertRowid || info.insertId]);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId).input('name', conn.sql.NVarChar, payload.name)
    .input('volumeLiters', conn.sql.Int, payload.volumeLiters).input('tankType', conn.sql.NVarChar, payload.tankType)
    .input('fishCount', conn.sql.Int, payload.fishCount).input('plantCount', conn.sql.Int, payload.plantCount)
    .input('fishNames', conn.sql.NVarChar, payload.fishNames).input('plantNames', conn.sql.NVarChar, payload.plantNames)
    .query(`INSERT INTO Tanks (UserID, Name, VolumeLiters, TankType, FishCount, PlantCount, FishNames, PlantNames) OUTPUT INSERTED.* VALUES (@userId, @name, @volumeLiters, @tankType, @fishCount, @plantCount, @fishNames, @plantNames)`);
  return result.recordset[0];
}

async function update(tankId, userId, data) {
  const conn = await getPool();
  const payload = tankPayload(data);
  if (isSqlite(conn) || isMysql(conn)) {
    await execute(
      conn,
      'UPDATE Tanks SET Name=?, VolumeLiters=?, TankType=?, FishCount=?, PlantCount=?, FishNames=?, PlantNames=? WHERE TankID=? AND UserID=?',
      [payload.name, payload.volumeLiters, payload.tankType, payload.fishCount, payload.plantCount, payload.fishNames, payload.plantNames, tankId, userId]
    );
    return queryOne(conn, 'SELECT * FROM Tanks WHERE TankID = ?', [tankId]);
  }
  const result = await conn.pool.request()
    .input('tankId', conn.sql.Int, tankId).input('userId', conn.sql.Int, userId)
    .input('name', conn.sql.NVarChar, payload.name).input('volumeLiters', conn.sql.Int, payload.volumeLiters)
    .input('tankType', conn.sql.NVarChar, payload.tankType).input('fishCount', conn.sql.Int, payload.fishCount)
    .input('plantCount', conn.sql.Int, payload.plantCount)
    .input('fishNames', conn.sql.NVarChar, payload.fishNames).input('plantNames', conn.sql.NVarChar, payload.plantNames)
    .query(`UPDATE Tanks SET Name=@name, VolumeLiters=@volumeLiters, TankType=@tankType, FishCount=@fishCount, PlantCount=@plantCount, FishNames=@fishNames, PlantNames=@plantNames OUTPUT INSERTED.* WHERE TankID=@tankId AND UserID=@userId`);
  return result.recordset[0];
}

async function remove(tankId, userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(conn, 'DELETE FROM Tanks WHERE TankID = ? AND UserID = ?', [tankId, userId]);
    return (info.changes ?? info.affectedRows) > 0;
  }
  const result = await conn.pool.request().input('tankId', conn.sql.Int, tankId).input('userId', conn.sql.Int, userId)
    .query('DELETE FROM Tanks WHERE TankID = @tankId AND UserID = @userId');
  return result.rowsAffected[0] > 0;
}

async function countByUser(userId) {
  const tanks = await findByUser(userId);
  return tanks.length;
}

async function totalFishByUser(userId) {
  const tanks = await findByUser(userId);
  return tanks.reduce((sum, tank) => {
    const fromNames = countInhabitants(tank.FishNames || tank.fishNames);
    const fromCol = Number(tank.FishCount ?? tank.fishCount ?? 0);
    return sum + (fromNames || fromCol || 0);
  }, 0);
}

module.exports = { findByUser, findById, create, update, remove, countByUser, totalFishByUser };
