const { getPool, isSqlite } = require('../config/db');

async function getTasksByUser(userId, filter) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    let sql = `SELECT mt.*, t.Name AS TankName FROM MaintenanceTasks mt LEFT JOIN Tanks t ON t.TankID = mt.TankID WHERE mt.UserID = ?`;
    if (filter === 'today') sql += ` AND mt.DueDate <= date('now') AND mt.IsCompleted = 0`;
    else if (filter === 'week') sql += ` AND mt.DueDate > date('now') AND mt.DueDate <= date('now', '+7 days') AND mt.IsCompleted = 0`;
    else if (filter === 'dashboard') sql += ` AND (mt.DueDate <= date('now') OR mt.DueDate = date('now', '+1 day'))`;
    sql += ' ORDER BY mt.DueDate ASC, mt.TaskID ASC';
    return conn.db.prepare(sql).all(userId);
  }
  let query = `SELECT mt.*, t.Name AS TankName FROM MaintenanceTasks mt LEFT JOIN Tanks t ON t.TankID = mt.TankID WHERE mt.UserID = @userId`;
  if (filter === 'today') query += ` AND mt.DueDate <= CAST(GETDATE() AS DATE) AND mt.IsCompleted = 0`;
  else if (filter === 'week') query += ` AND mt.DueDate > CAST(GETDATE() AS DATE) AND mt.DueDate <= DATEADD(day, 7, CAST(GETDATE() AS DATE)) AND mt.IsCompleted = 0`;
  else if (filter === 'dashboard') query += ` AND (mt.DueDate <= CAST(GETDATE() AS DATE) OR mt.DueDate = DATEADD(day, 1, CAST(GETDATE() AS DATE)))`;
  query += ' ORDER BY mt.DueDate ASC, mt.TaskID ASC';
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).query(query);
  return result.recordset;
}

async function createTask(userId, data) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    const info = conn.db.prepare('INSERT INTO MaintenanceTasks (UserID, TankID, TaskName, DueDate, DueTime) VALUES (?, ?, ?, ?, ?)')
      .run(userId, data.tankId || null, data.taskName, data.dueDate, data.dueTime || null);
    return conn.db.prepare('SELECT * FROM MaintenanceTasks WHERE TaskID = ?').get(info.lastInsertRowid);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId).input('tankId', conn.sql.Int, data.tankId || null)
    .input('taskName', conn.sql.NVarChar, data.taskName).input('dueDate', conn.sql.Date, data.dueDate)
    .input('dueTime', conn.sql.NVarChar, data.dueTime || null)
    .query(`INSERT INTO MaintenanceTasks (UserID, TankID, TaskName, DueDate, DueTime) OUTPUT INSERTED.* VALUES (@userId, @tankId, @taskName, @dueDate, @dueTime)`);
  return result.recordset[0];
}

async function findTaskById(taskId, userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT * FROM MaintenanceTasks WHERE TaskID = ? AND UserID = ?').get(taskId, userId);
  }
  const result = await conn.pool.request().input('taskId', conn.sql.Int, taskId).input('userId', conn.sql.Int, userId)
    .query('SELECT * FROM MaintenanceTasks WHERE TaskID = @taskId AND UserID = @userId');
  return result.recordset[0];
}

async function toggleComplete(taskId, userId, isCompleted) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    conn.db.prepare(`UPDATE MaintenanceTasks SET IsCompleted = ?, CompletedAt = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END WHERE TaskID = ? AND UserID = ?`)
      .run(isCompleted ? 1 : 0, isCompleted ? 1 : 0, taskId, userId);
    return conn.db.prepare('SELECT * FROM MaintenanceTasks WHERE TaskID = ?').get(taskId);
  }
  const result = await conn.pool.request()
    .input('taskId', conn.sql.Int, taskId).input('userId', conn.sql.Int, userId).input('isCompleted', conn.sql.Bit, isCompleted)
    .query(`UPDATE MaintenanceTasks SET IsCompleted=@isCompleted, CompletedAt=CASE WHEN @isCompleted=1 THEN GETDATE() ELSE NULL END OUTPUT INSERTED.* WHERE TaskID=@taskId AND UserID=@userId`);
  return result.recordset[0];
}

async function removeTask(taskId, userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('DELETE FROM MaintenanceTasks WHERE TaskID = ? AND UserID = ?').run(taskId, userId).changes > 0;
  }
  const result = await conn.pool.request().input('taskId', conn.sql.Int, taskId).input('userId', conn.sql.Int, userId)
    .query('DELETE FROM MaintenanceTasks WHERE TaskID = @taskId AND UserID = @userId');
  return result.rowsAffected[0] > 0;
}

async function countDueToday(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare(`SELECT COUNT(*) AS count FROM MaintenanceTasks WHERE UserID = ? AND IsCompleted = 0 AND DueDate <= date('now')`).get(userId).count;
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId)
    .query(`SELECT COUNT(*) AS count FROM MaintenanceTasks WHERE UserID = @userId AND IsCompleted = 0 AND DueDate <= CAST(GETDATE() AS DATE)`);
  return result.recordset[0].count;
}

async function countOverdue(userId) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare(`SELECT COUNT(*) AS count FROM MaintenanceTasks WHERE UserID = ? AND IsCompleted = 0 AND DueDate < date('now')`).get(userId).count;
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId)
    .query(`SELECT COUNT(*) AS count FROM MaintenanceTasks WHERE UserID = @userId AND IsCompleted = 0 AND DueDate < CAST(GETDATE() AS DATE)`);
  return result.recordset[0].count;
}

async function getLogs(userId, limit = 50) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare(`
      SELECT ml.*, t.Name AS TankName FROM MaintenanceLogs ml LEFT JOIN Tanks t ON t.TankID = ml.TankID
      WHERE ml.UserID = ? ORDER BY ml.CompletedAt DESC LIMIT ?
    `).all(userId, limit);
  }
  const result = await conn.pool.request().input('userId', conn.sql.Int, userId).input('limit', conn.sql.Int, limit).query(`
    SELECT TOP (@limit) ml.*, t.Name AS TankName FROM MaintenanceLogs ml LEFT JOIN Tanks t ON t.TankID = ml.TankID
    WHERE ml.UserID = @userId ORDER BY ml.CompletedAt DESC`);
  return result.recordset;
}

async function createLog(userId, data) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    const info = conn.db.prepare('INSERT INTO MaintenanceLogs (UserID, TankID, TaskName, DurationMinutes, Notes) VALUES (?, ?, ?, ?, ?)')
      .run(userId, data.tankId || null, data.taskName, data.durationMinutes || null, data.notes || null);
    return conn.db.prepare('SELECT * FROM MaintenanceLogs WHERE LogID = ?').get(info.lastInsertRowid);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId).input('tankId', conn.sql.Int, data.tankId || null)
    .input('taskName', conn.sql.NVarChar, data.taskName).input('durationMinutes', conn.sql.Int, data.durationMinutes || null)
    .input('notes', conn.sql.NVarChar, data.notes || null)
    .query(`INSERT INTO MaintenanceLogs (UserID, TankID, TaskName, DurationMinutes, Notes) OUTPUT INSERTED.* VALUES (@userId, @tankId, @taskName, @durationMinutes, @notes)`);
  return result.recordset[0];
}

module.exports = { getTasksByUser, createTask, findTaskById, toggleComplete, removeTask, countDueToday, countOverdue, getLogs, createLog };
