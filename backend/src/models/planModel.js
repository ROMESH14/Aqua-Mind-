const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute } = require('../config/dbHelpers');

async function findByUser(userId, query, kind) {
  const conn = await getPool();
  const q = String(query || '').trim();
  const kindFilter = String(kind || '').trim();
  if (isSqlite(conn) || isMysql(conn)) {
    const where = ['UserID = ?'];
    const params = [userId];
    if (kindFilter) {
      where.push('Kind = ?');
      params.push(kindFilter);
    }
    if (q) {
      where.push('(Title LIKE ? OR SearchText LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    return queryAll(
      conn,
      `SELECT * FROM SavedPlans WHERE ${where.join(' AND ')} ORDER BY PlanID DESC`,
      params
    );
  }
  const request = conn.pool.request().input('userId', conn.sql.Int, userId);
  let extra = '';
  if (kindFilter) {
    request.input('kind', conn.sql.NVarChar, kindFilter);
    extra += ' AND Kind = @kind';
  }
  if (q) {
    request.input('q', conn.sql.NVarChar, `%${q}%`);
    extra += ' AND (Title LIKE @q OR SearchText LIKE @q)';
  }
  const result = await request.query(`SELECT * FROM SavedPlans WHERE UserID = @userId${extra} ORDER BY PlanID DESC`);
  return result.recordset;
}

async function findById(planId, userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT * FROM SavedPlans WHERE PlanID = ? AND UserID = ?', [planId, userId]);
  }
  const result = await conn.pool.request()
    .input('planId', conn.sql.Int, planId)
    .input('userId', conn.sql.Int, userId)
    .query('SELECT * FROM SavedPlans WHERE PlanID = @planId AND UserID = @userId');
  return result.recordset[0];
}

async function create(userId, data) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(
      conn,
      'INSERT INTO SavedPlans (UserID, Kind, Title, SearchText, FormJSON, ResultJSON) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, data.kind, data.title, data.searchText, data.formJson, data.resultJson]
    );
    return queryOne(conn, 'SELECT * FROM SavedPlans WHERE PlanID = ?', [info.lastInsertRowid || info.insertId]);
  }
  const result = await conn.pool.request()
    .input('userId', conn.sql.Int, userId)
    .input('kind', conn.sql.NVarChar, data.kind)
    .input('title', conn.sql.NVarChar, data.title)
    .input('searchText', conn.sql.NVarChar, data.searchText)
    .input('formJson', conn.sql.NVarChar, data.formJson)
    .input('resultJson', conn.sql.NVarChar, data.resultJson)
    .query(`INSERT INTO SavedPlans (UserID, Kind, Title, SearchText, FormJSON, ResultJSON)
            OUTPUT INSERTED.* VALUES (@userId, @kind, @title, @searchText, @formJson, @resultJson)`);
  return result.recordset[0];
}

async function remove(planId, userId) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(conn, 'DELETE FROM SavedPlans WHERE PlanID = ? AND UserID = ?', [planId, userId]);
    return (info.changes ?? info.affectedRows) > 0;
  }
  const result = await conn.pool.request()
    .input('planId', conn.sql.Int, planId)
    .input('userId', conn.sql.Int, userId)
    .query('DELETE FROM SavedPlans WHERE PlanID = @planId AND UserID = @userId');
  return result.rowsAffected[0] > 0;
}

module.exports = { findByUser, findById, create, remove };
