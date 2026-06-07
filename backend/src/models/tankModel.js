const { getPool, isSqlite } = require('../config/db');

async function findByUser(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare(`
      SELECT t.*,
        (SELECT wr.pH FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC LIMIT 1) AS LatestPH,
        (SELECT wr.Temperature FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC LIMIT 1) AS LatestTemp,
        (SELECT wr.Ammonia FROM WaterReadings wr WHERE wr.TankID = t.TankID ORDER BY wr.RecordedAt DESC LIMIT 1) AS LatestAmmonia
      FROM Tanks t WHERE t.UserID = ? ORDER BY t.CreatedAt DESC
    `).all(userId);
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
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT * FROM Tanks WHERE TankID = ? AND UserID = ?').get(tankId, userId);
  }
  const result = await conn.pool.request().input('tankId', conn.sql.Int, tankId).input('userId', conn.sql.Int, userId)
    .query('SELECT * FROM Tanks WHERE TankID = @tankId AND UserID = @userId');
  return result.recordset[0];
}

async function create(userId, data) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    const info = conn.db.prepare(
      'INSERT INTO Tanks (UserID, Name, VolumeLiters, TankType, FishCount, PlantCount) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, data.name, data.volumeLiters || null, data.tankType || null, data.fishCount || 0, data.plantCount || 0);
    return conn.db.prepare('SELECT * FROM Tanks WHERE TankID = ?').get(info.lastInsertRowid);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId).input('name', conn.sql.NVarChar, data.name)
    .input('volumeLiters', conn.sql.Int, data.volumeLiters || null).input('tankType', conn.sql.NVarChar, data.tankType || null)
    .input('fishCount', conn.sql.Int, data.fishCount || 0).input('plantCount', conn.sql.Int, data.plantCount || 0)
    .query(`INSERT INTO Tanks (UserID, Name, VolumeLiters, TankType, FishCount, PlantCount) OUTPUT INSERTED.* VALUES (@userId, @name, @volumeLiters, @tankType, @fishCount, @plantCount)`);
  return result.recordset[0];
}

async function update(tankId, userId, data) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    conn.db.prepare(`UPDATE Tanks SET Name=?, VolumeLiters=?, TankType=?, FishCount=?, PlantCount=? WHERE TankID=? AND UserID=?`)
      .run(data.name, data.volumeLiters || null, data.tankType || null, data.fishCount ?? 0, data.plantCount ?? 0, tankId, userId);
    return conn.db.prepare('SELECT * FROM Tanks WHERE TankID = ?').get(tankId);
  }
  const result = await conn.pool.request()
    .input('tankId', conn.sql.Int, tankId).input('userId', conn.sql.Int, userId)
    .input('name', conn.sql.NVarChar, data.name).input('volumeLiters', conn.sql.Int, data.volumeLiters || null)
    .input('tankType', conn.sql.NVarChar, data.tankType || null).input('fishCount', conn.sql.Int, data.fishCount ?? 0)
    .input('plantCount', conn.sql.Int, data.plantCount ?? 0)
    .query(`UPDATE Tanks SET Name=@name, VolumeLiters=@volumeLiters, TankType=@tankType, FishCount=@fishCount, PlantCount=@plantCount OUTPUT INSERTED.* WHERE TankID=@tankId AND UserID=@userId`);
  return result.recordset[0];
}

async function remove(tankId, userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('DELETE FROM Tanks WHERE TankID = ? AND UserID = ?').run(tankId, userId).changes > 0;
  }
  const result = await conn.pool.request().input('tankId', conn.sql.Int, tankId).input('userId', conn.sql.Int, userId)
    .query('DELETE FROM Tanks WHERE TankID = @tankId AND UserID = @userId');
  return result.rowsAffected[0] > 0;
}

async function countByUser(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT COUNT(*) AS count FROM Tanks WHERE UserID = ?').get(userId).count;
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).query('SELECT COUNT(*) AS count FROM Tanks WHERE UserID = @userId');
  return result.recordset[0].count;
}

async function totalFishByUser(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT COALESCE(SUM(FishCount), 0) AS total FROM Tanks WHERE UserID = ?').get(userId).total;
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).query('SELECT ISNULL(SUM(FishCount), 0) AS total FROM Tanks WHERE UserID = @userId');
  return result.recordset[0].total;
}

module.exports = { findByUser, findById, create, update, remove, countByUser, totalFishByUser };
