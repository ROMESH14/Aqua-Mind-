const { getPool, isSqlite } = require('../config/db');

async function create(userId, { tankId, alertType, title, detail }) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    const info = conn.db.prepare('INSERT INTO Alerts (UserID, TankID, AlertType, Title, Detail) VALUES (?, ?, ?, ?, ?)')
      .run(userId, tankId || null, alertType, title, detail || null);
    return conn.db.prepare('SELECT * FROM Alerts WHERE AlertID = ?').get(info.lastInsertRowid);
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
    return conn.db.prepare(`
      SELECT a.*, t.Name AS TankName FROM Alerts a LEFT JOIN Tanks t ON t.TankID = a.TankID
      WHERE a.UserID = ? ORDER BY a.CreatedAt DESC LIMIT ?
    `).all(userId, limit);
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).input('limit', conn.sql.Int, limit).query(`
    SELECT TOP (@limit) a.*, t.Name AS TankName FROM Alerts a LEFT JOIN Tanks t ON t.TankID = a.TankID
    WHERE a.UserID = @userId ORDER BY a.CreatedAt DESC`);
  return result.recordset;
}

async function countUnread(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT COUNT(*) AS count FROM Alerts WHERE UserID = ? AND IsRead = 0').get(userId).count;
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId)
    .query('SELECT COUNT(*) AS count FROM Alerts WHERE UserID = @userId AND IsRead = 0');
  return result.recordset[0].count;
}

module.exports = { create, getByUser, countUnread };
