const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute } = require('../config/dbHelpers');

async function findByUser(userId, tankId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const sql = tankId
      ? `SELECT e.*, t.Name AS TankName FROM Equipment e
         LEFT JOIN Tanks t ON t.TankID = e.TankID
         WHERE e.UserID = ? AND e.TankID = ? ORDER BY e.Type ASC, e.EquipmentID DESC`
      : `SELECT e.*, t.Name AS TankName FROM Equipment e
         LEFT JOIN Tanks t ON t.TankID = e.TankID
         WHERE e.UserID = ? ORDER BY e.Type ASC, e.EquipmentID DESC`;
    return queryAll(conn, sql, tankId ? [userId, tankId] : [userId]);
  }
  const request = conn.pool.request().input('userId', conn.sql.Int, userId);
  if (tankId) request.input('tankId', conn.sql.Int, tankId);
  const result = await request.query(`
    SELECT e.*, t.Name AS TankName FROM Equipment e
    LEFT JOIN Tanks t ON t.TankID = e.TankID
    WHERE e.UserID = @userId ${tankId ? 'AND e.TankID = @tankId' : ''}
    ORDER BY e.Type ASC, e.EquipmentID DESC`);
  return result.recordset;
}

async function findById(equipmentId, userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT * FROM Equipment WHERE EquipmentID = ? AND UserID = ?', [equipmentId, userId]);
  }
  const result = await conn.pool.request()
    .input('equipmentId', conn.sql.Int, equipmentId)
    .input('userId', conn.sql.Int, userId)
    .query('SELECT * FROM Equipment WHERE EquipmentID = @equipmentId AND UserID = @userId');
  return result.recordset[0];
}

async function create(userId, data) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(
      conn,
      'INSERT INTO Equipment (UserID, TankID, Name, Type, Brand, Status, Notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, data.tankId || null, data.name, data.type, data.brand || null, data.status || 'Working', data.notes || null]
    );
    return queryOne(conn, 'SELECT * FROM Equipment WHERE EquipmentID = ?', [info.lastInsertRowid || info.insertId]);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId)
    .input('tankId', conn.sql.Int, data.tankId || null)
    .input('name', conn.sql.NVarChar, data.name)
    .input('type', conn.sql.NVarChar, data.type)
    .input('brand', conn.sql.NVarChar, data.brand || null)
    .input('status', conn.sql.NVarChar, data.status || 'Working')
    .input('notes', conn.sql.NVarChar, data.notes || null)
    .query(`INSERT INTO Equipment (UserID, TankID, Name, Type, Brand, Status, Notes)
            OUTPUT INSERTED.* VALUES (@userId, @tankId, @name, @type, @brand, @status, @notes)`);
  return result.recordset[0];
}

async function update(equipmentId, userId, data) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    await execute(
      conn,
      `UPDATE Equipment SET TankID = ?, Name = ?, Type = ?, Brand = ?, Status = ?, Notes = ?
       WHERE EquipmentID = ? AND UserID = ?`,
      [data.tankId || null, data.name, data.type, data.brand || null, data.status, data.notes || null, equipmentId, userId]
    );
    return queryOne(conn, 'SELECT * FROM Equipment WHERE EquipmentID = ?', [equipmentId]);
  }
  const result = await conn.pool.request()
    .input('equipmentId', conn.sql.Int, equipmentId)
    .input('userId', conn.sql.Int, userId)
    .input('tankId', conn.sql.Int, data.tankId || null)
    .input('name', conn.sql.NVarChar, data.name)
    .input('type', conn.sql.NVarChar, data.type)
    .input('brand', conn.sql.NVarChar, data.brand || null)
    .input('status', conn.sql.NVarChar, data.status)
    .input('notes', conn.sql.NVarChar, data.notes || null)
    .query(`UPDATE Equipment SET TankID=@tankId, Name=@name, Type=@type, Brand=@brand, Status=@status, Notes=@notes
            OUTPUT INSERTED.* WHERE EquipmentID=@equipmentId AND UserID=@userId`);
  return result.recordset[0];
}

async function remove(equipmentId, userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(conn, 'DELETE FROM Equipment WHERE EquipmentID = ? AND UserID = ?', [equipmentId, userId]);
    return (info.changes ?? info.affectedRows) > 0;
  }
  const result = await conn.pool.request()
    .input('equipmentId', conn.sql.Int, equipmentId)
    .input('userId', conn.sql.Int, userId)
    .query('DELETE FROM Equipment WHERE EquipmentID = @equipmentId AND UserID = @userId');
  return result.rowsAffected[0] > 0;
}

module.exports = { findByUser, findById, create, update, remove };
