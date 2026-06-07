const { getPool, isSqlite } = require('../config/db');

async function createReading(tankId, data) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    const info = conn.db.prepare(
      'INSERT INTO WaterReadings (TankID, pH, Temperature, Ammonia, Nitrite, Nitrate, DissolvedO2) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(tankId, data.pH ?? null, data.temperature ?? null, data.ammonia ?? null, data.nitrite ?? null, data.nitrate ?? null, data.dissolvedO2 ?? null);
    return conn.db.prepare('SELECT * FROM WaterReadings WHERE ReadingID = ?').get(info.lastInsertRowid);
  }
  const result = await conn.pool.request()
    .input('tankId', conn.sql.Int, tankId).input('pH', conn.sql.Decimal(4, 2), data.pH ?? null)
    .input('temperature', conn.sql.Decimal(4, 1), data.temperature ?? null).input('ammonia', conn.sql.Decimal(6, 3), data.ammonia ?? null)
    .input('nitrite', conn.sql.Decimal(6, 3), data.nitrite ?? null).input('nitrate', conn.sql.Decimal(6, 1), data.nitrate ?? null)
    .input('dissolvedO2', conn.sql.Decimal(4, 1), data.dissolvedO2 ?? null)
    .query(`INSERT INTO WaterReadings (TankID, pH, Temperature, Ammonia, Nitrite, Nitrate, DissolvedO2) OUTPUT INSERTED.* VALUES (@tankId, @pH, @temperature, @ammonia, @nitrite, @nitrate, @dissolvedO2)`);
  return result.recordset[0];
}

async function getLatestByTank(tankId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT * FROM WaterReadings WHERE TankID = ? ORDER BY RecordedAt DESC LIMIT 1').get(tankId);
  }
  const result = await conn.pool.request().input('tankId', conn.sql.Int, tankId)
    .query('SELECT TOP 1 * FROM WaterReadings WHERE TankID = @tankId ORDER BY RecordedAt DESC');
  return result.recordset[0];
}

async function getHistoryByTank(tankId, limit = 50) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT * FROM WaterReadings WHERE TankID = ? ORDER BY RecordedAt DESC LIMIT ?').all(tankId, limit);
  }
  const result = await conn.pool.request().input('tankId', conn.sql.Int, tankId).input('limit', conn.sql.Int, limit)
    .query('SELECT TOP (@limit) * FROM WaterReadings WHERE TankID = @tankId ORDER BY RecordedAt DESC');
  return result.recordset;
}

async function getTemperatureTrend(userId, days = 7) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare(`
      SELECT wr.Temperature, wr.RecordedAt, t.Name AS TankName, t.TankID
      FROM WaterReadings wr INNER JOIN Tanks t ON t.TankID = wr.TankID
      WHERE t.UserID = ? AND wr.Temperature IS NOT NULL
        AND wr.RecordedAt >= datetime('now', '-' || ? || ' days')
      ORDER BY wr.RecordedAt ASC
    `).all(userId, days);
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).input('days', conn.sql.Int, days).query(`
    SELECT wr.Temperature, wr.RecordedAt, t.Name AS TankName, t.TankID FROM WaterReadings wr
    INNER JOIN Tanks t ON t.TankID = wr.TankID WHERE t.UserID = @userId AND wr.Temperature IS NOT NULL
    AND wr.RecordedAt >= DATEADD(day, -@days, GETDATE()) ORDER BY wr.RecordedAt ASC`);
  return result.recordset;
}

async function getAvgPHByUser(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare(`
      SELECT AVG(wr.pH) AS avgPH FROM WaterReadings wr INNER JOIN Tanks t ON t.TankID = wr.TankID
      WHERE t.UserID = ? AND wr.pH IS NOT NULL AND wr.RecordedAt >= datetime('now', '-30 days')
    `).get(userId)?.avgPH;
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).query(`
    SELECT AVG(wr.pH) AS avgPH FROM WaterReadings wr INNER JOIN Tanks t ON t.TankID = wr.TankID
    WHERE t.UserID = @userId AND wr.pH IS NOT NULL AND wr.RecordedAt >= DATEADD(day, -30, GETDATE())`);
  return result.recordset[0]?.avgPH;
}

module.exports = { createReading, getLatestByTank, getHistoryByTank, getTemperatureTrend, getAvgPHByUser };
