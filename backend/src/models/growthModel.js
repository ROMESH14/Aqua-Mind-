const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute } = require('../config/dbHelpers');

async function findByUser(userId, tankId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const sql = tankId
      ? `SELECT g.*, t.Name AS TankName FROM GrowthRecords g
         LEFT JOIN Tanks t ON t.TankID = g.TankID
         WHERE g.UserID = ? AND g.TankID = ? ORDER BY g.RecordedAt ASC, g.GrowthID ASC`
      : `SELECT g.*, t.Name AS TankName FROM GrowthRecords g
         LEFT JOIN Tanks t ON t.TankID = g.TankID
         WHERE g.UserID = ? ORDER BY g.RecordedAt ASC, g.GrowthID ASC`;
    return queryAll(conn, sql, tankId ? [userId, tankId] : [userId]);
  }
  const request = conn.pool.request().input('userId', conn.sql.Int, userId);
  if (tankId) request.input('tankId', conn.sql.Int, tankId);
  const result = await request.query(`
    SELECT g.*, t.Name AS TankName FROM GrowthRecords g
    LEFT JOIN Tanks t ON t.TankID = g.TankID
    WHERE g.UserID = @userId ${tankId ? 'AND g.TankID = @tankId' : ''}
    ORDER BY g.RecordedAt ASC, g.GrowthID ASC`);
  return result.recordset;
}

async function create(userId, data) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(
      conn,
      'INSERT INTO GrowthRecords (UserID, TankID, FishName, LengthCm, WeightG, Notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, data.tankId, data.fishName, data.lengthCm, data.weightG || null, data.notes || null]
    );
    return queryOne(conn, 'SELECT * FROM GrowthRecords WHERE GrowthID = ?', [info.lastInsertRowid || info.insertId]);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId)
    .input('tankId', conn.sql.Int, data.tankId)
    .input('fishName', conn.sql.NVarChar, data.fishName)
    .input('lengthCm', conn.sql.Float, data.lengthCm)
    .input('weightG', conn.sql.Float, data.weightG || null)
    .input('notes', conn.sql.NVarChar, data.notes || null)
    .query(`INSERT INTO GrowthRecords (UserID, TankID, FishName, LengthCm, WeightG, Notes)
            OUTPUT INSERTED.* VALUES (@userId, @tankId, @fishName, @lengthCm, @weightG, @notes)`);
  return result.recordset[0];
}

async function remove(growthId, userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(conn, 'DELETE FROM GrowthRecords WHERE GrowthID = ? AND UserID = ?', [growthId, userId]);
    return (info.changes ?? info.affectedRows) > 0;
  }
  const result = await conn.pool.request()
    .input('growthId', conn.sql.Int, growthId)
    .input('userId', conn.sql.Int, userId)
    .query('DELETE FROM GrowthRecords WHERE GrowthID = @growthId AND UserID = @userId');
  return result.rowsAffected[0] > 0;
}

module.exports = { findByUser, create, remove };
