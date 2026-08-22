const { isSqlite, isMysql } = require('./db');

async function queryOne(conn, sql, params = []) {
  if (isSqlite(conn)) {
    return conn.db.prepare(sql).get(...params);
  }
  if (isMysql(conn)) {
    const [rows] = await conn.pool.execute(sql, params);
    return rows[0];
  }
  throw new Error('Unsupported database driver');
}

async function queryAll(conn, sql, params = []) {
  if (isSqlite(conn)) {
    return conn.db.prepare(sql).all(...params);
  }
  if (isMysql(conn)) {
    const [rows] = await conn.pool.execute(sql, params);
    return rows;
  }
  throw new Error('Unsupported database driver');
}

async function execute(conn, sql, params = []) {
  if (isSqlite(conn)) {
    return conn.db.prepare(sql).run(...params);
  }
  if (isMysql(conn)) {
    const [result] = await conn.pool.execute(sql, params);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  }
  throw new Error('Unsupported database driver');
}

function safeLimit(limit, fallback = 50, max = 500) {
  return Math.max(1, Math.min(parseInt(limit, 10) || fallback, max));
}

module.exports = { queryOne, queryAll, execute, safeLimit };
