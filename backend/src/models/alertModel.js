const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute, safeLimit } = require('../config/dbHelpers');
const notifyHub = require('../realtime/notifyHub');

function formatNotify(row) {
  const created = row.CreatedAt || new Date();
  const seconds = Math.floor((Date.now() - new Date(created)) / 1000);
  let time = 'Just now';
  if (seconds >= 60 && seconds < 3600) time = `${Math.floor(seconds / 60)} min ago`;
  else if (seconds >= 3600 && seconds < 86400) time = `${Math.floor(seconds / 3600)} hrs ago`;
  else if (seconds >= 86400) time = new Date(created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return {
    id: row.AlertID,
    type: row.AlertType || 'info',
    title: row.Title,
    detail: row.Detail || '',
    tankName: row.TankName || '',
    read: Boolean(row.IsRead),
    createdAt: created,
    time,
    href: row.AlertType === 'task' ? '/maintenance' : '/water',
  };
}

async function create(userId, { tankId, alertType, title, detail }) {
  const conn = await getPool();
  let row;
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(
      conn,
      'INSERT INTO Alerts (UserID, TankID, AlertType, Title, Detail) VALUES (?, ?, ?, ?, ?)',
      [userId, tankId || null, alertType, title, detail || null]
    );
    row = await queryOne(conn, 'SELECT * FROM Alerts WHERE AlertID = ?', [info.lastInsertRowid || info.insertId]);
  } else {
    const result = await conn.pool.request()
      .input('userId', conn.sql.Int, userId).input('tankId', conn.sql.Int, tankId || null)
      .input('alertType', conn.sql.NVarChar, alertType).input('title', conn.sql.NVarChar, title)
      .input('detail', conn.sql.NVarChar, detail || null)
      .query(`INSERT INTO Alerts (UserID, TankID, AlertType, Title, Detail) OUTPUT INSERTED.* VALUES (@userId, @tankId, @alertType, @title, @detail)`);
    row = result.recordset[0];
  }
  if (row) notifyHub.sendToUser(userId, 'alert', formatNotify(row));
  return row;
}

async function markAllRead(userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    await execute(conn, 'UPDATE Alerts SET IsRead = 1 WHERE UserID = ?', [userId]);
    return;
  }
  await conn.pool.request().input('userId', conn.sql.Int, userId)
    .query('UPDATE Alerts SET IsRead = 1 WHERE UserID = @userId');
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

module.exports = { create, getByUser, markAllRead, formatNotify };
