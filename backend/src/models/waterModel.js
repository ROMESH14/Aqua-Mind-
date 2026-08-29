const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute, safeLimit } = require('../config/dbHelpers');

async function createReading(tankId, data) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(
      conn,
      'INSERT INTO WaterReadings (TankID, pH, Temperature, Ammonia, Nitrite, Nitrate, DissolvedO2) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tankId, data.pH ?? null, data.temperature ?? null, data.ammonia ?? null, data.nitrite ?? null, data.nitrate ?? null, data.dissolvedO2 ?? null]
    );
    return queryOne(conn, 'SELECT * FROM WaterReadings WHERE ReadingID = ?', [info.lastInsertRowid || info.insertId]);
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
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT * FROM WaterReadings WHERE TankID = ? ORDER BY RecordedAt DESC LIMIT 1', [tankId]);
  }
  const result = await conn.pool.request().input('tankId', conn.sql.Int, tankId)
    .query('SELECT TOP 1 * FROM WaterReadings WHERE TankID = @tankId ORDER BY RecordedAt DESC');
  return result.recordset[0];
}

async function getHistoryByTank(tankId, limit = 50) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return queryAll(conn, 'SELECT * FROM WaterReadings WHERE TankID = ? ORDER BY RecordedAt DESC LIMIT ?', [tankId, limit]);
  }
  if (isMysql(conn)) {
    const lim = safeLimit(limit);
    return queryAll(conn, `SELECT * FROM WaterReadings WHERE TankID = ? ORDER BY RecordedAt DESC LIMIT ${lim}`, [tankId]);
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
  if (isMysql(conn)) {
    return queryAll(conn, `
      SELECT wr.Temperature, wr.RecordedAt, t.Name AS TankName, t.TankID
      FROM WaterReadings wr INNER JOIN Tanks t ON t.TankID = wr.TankID
      WHERE t.UserID = ? AND wr.Temperature IS NOT NULL
        AND wr.RecordedAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY wr.RecordedAt ASC
    `, [userId, days]);
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).input('days', conn.sql.Int, days).query(`
    SELECT wr.Temperature, wr.RecordedAt, t.Name AS TankName, t.TankID FROM WaterReadings wr
    INNER JOIN Tanks t ON t.TankID = wr.TankID WHERE t.UserID = @userId AND wr.Temperature IS NOT NULL
    AND wr.RecordedAt >= DATEADD(day, -@days, GETDATE()) ORDER BY wr.RecordedAt ASC`);
  return result.recordset;
}

async function deleteReading(readingId, tankId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(conn, 'DELETE FROM WaterReadings WHERE ReadingID = ? AND TankID = ?', [readingId, tankId]);
    return (info.changes ?? info.affectedRows) > 0;
  }
  const result = await conn.pool.request()
    .input('readingId', conn.sql.Int, readingId)
    .input('tankId', conn.sql.Int, tankId)
    .query('DELETE FROM WaterReadings WHERE ReadingID = @readingId AND TankID = @tankId');
  return result.rowsAffected[0] > 0;
}

async function getAvgPHByUser(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare(`
      SELECT AVG(wr.pH) AS avgPH FROM WaterReadings wr INNER JOIN Tanks t ON t.TankID = wr.TankID
      WHERE t.UserID = ? AND wr.pH IS NOT NULL AND wr.RecordedAt >= datetime('now', '-30 days')
    `).get(userId)?.avgPH;
  }
  if (isMysql(conn)) {
    const row = await queryOne(conn, `
      SELECT AVG(wr.pH) AS avgPH FROM WaterReadings wr INNER JOIN Tanks t ON t.TankID = wr.TankID
      WHERE t.UserID = ? AND wr.pH IS NOT NULL AND wr.RecordedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [userId]);
    return row?.avgPH;
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).query(`
    SELECT AVG(wr.pH) AS avgPH FROM WaterReadings wr INNER JOIN Tanks t ON t.TankID = wr.TankID
    WHERE t.UserID = @userId AND wr.pH IS NOT NULL AND wr.RecordedAt >= DATEADD(day, -30, GETDATE())`);
  return result.recordset[0]?.avgPH;
}

module.exports = { createReading, getLatestByTank, getHistoryByTank, deleteReading, getTemperatureTrend, getAvgPHByUser };
