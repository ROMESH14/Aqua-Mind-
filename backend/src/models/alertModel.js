const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute, safeLimit } = require('../config/dbHelpers');

async function create(userId, { tankId, alertType, title, detail }) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(
      conn,
      'INSERT INTO Alerts (UserID, TankID, AlertType, Title, Detail) VALUES (?, ?, ?, ?, ?)',
      [userId, tankId || null, alertType, title, detail || null]
    );
    return queryOne(conn, 'SELECT * FROM Alerts WHERE AlertID = ?', [info.lastInsertRowid || info.insertId]);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId).input('tankId', conn.sql.Int, tankId || null)
    .input('alertType', conn.sql.NVarChar, alertType).input('title', conn.sql.NVarChar, title)
    .input('detail', conn.sql.NVarChar, detail || null)
    .query(`INSERT INTO Alerts (UserID, TankID, AlertType, Title, Detail) OUTPUT INSERTED.* VALUES (@userId, @tankId, @alertType, @title, @detail)`);
  return result.recordset[0];
}

async function getByUser(userId, limit = 20) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return queryAll(conn, `
      SELECT a.*, t.Name AS TankName FROM Alerts a LEFT JOIN Tanks t ON t.TankID = a.TankID
      WHERE a.UserID = ? ORDER BY a.CreatedAt DESC LIMIT ?
    `, [userId, limit]);
  }
  if (isMysql(conn)) {
    const lim = safeLimit(limit, 20, 200);
    return queryAll(conn, `
      SELECT a.*, t.Name AS TankName FROM Alerts a LEFT JOIN Tanks t ON t.TankID = a.TankID
      WHERE a.UserID = ? ORDER BY a.CreatedAt DESC LIMIT ${lim}
    `, [userId]);
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).input('limit', conn.sql.Int, limit).query(`
    SELECT TOP (@limit) a.*, t.Name AS TankName FROM Alerts a LEFT JOIN Tanks t ON t.TankID = a.TankID
    WHERE a.UserID = @userId ORDER BY a.CreatedAt DESC`);
  return result.recordset;
}

module.exports = { create, getByUser };
