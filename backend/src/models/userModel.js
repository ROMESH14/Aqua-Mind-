const { getPool, isSqlite, isMysql } = require('../config/db');
const { queryOne, queryAll, execute } = require('../config/dbHelpers');

async function findByEmail(email) {
  const conn = await getPool();
  const normalized = String(email || '').trim().toLowerCase();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT * FROM Users WHERE LOWER(Email) = ?', [normalized]);
  }
  const result = await conn.pool.request()
    .input('email', conn.sql.NVarChar, email)
    .query('SELECT * FROM Users WHERE Email = @email');
  return result.recordset[0];
}

async function findByUsername(username) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT * FROM Users WHERE Username = ?', [username]);
  }
  const result = await conn.pool.request()
    .input('username', conn.sql.NVarChar, username)
    .query('SELECT * FROM Users WHERE Username = @username');
  return result.recordset[0];
}

async function findById(id) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT UserID, Username, Email, CreatedAt FROM Users WHERE UserID = ?', [id]);
  }
  const result = await conn.pool.request()
    .input('id', conn.sql.Int, id)
    .query('SELECT UserID, Username, Email, CreatedAt FROM Users WHERE UserID = @id');
  return result.recordset[0];
}

async function create({ username, email, passwordHash }) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    const info = await execute(conn, 'INSERT INTO Users (Username, Email, PasswordHash) VALUES (?, ?, ?)', [username, email, passwordHash]);
    return queryOne(conn, 'SELECT UserID, Username, Email, CreatedAt FROM Users WHERE UserID = ?', [info.lastInsertRowid || info.insertId]);
  }
  const result = await conn.pool.request()
    .input('username', conn.sql.NVarChar, username)
    .input('email', conn.sql.NVarChar, email)
    .input('passwordHash', conn.sql.NVarChar, passwordHash)
    .query(`
      INSERT INTO Users (Username, Email, PasswordHash)
      OUTPUT INSERTED.UserID, INSERTED.Username, INSERTED.Email, INSERTED.CreatedAt
      VALUES (@username, @email, @passwordHash)
    `);
  return result.recordset[0];
}

async function findAuthById(id) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    return queryOne(conn, 'SELECT * FROM Users WHERE UserID = ?', [id]);
  }
  const result = await conn.pool.request()
    .input('id', conn.sql.Int, id)
    .query('SELECT * FROM Users WHERE UserID = @id');
  return result.recordset[0];
}

async function updateProfile(id, { username, email }) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    await execute(conn, 'UPDATE Users SET Username = ?, Email = ? WHERE UserID = ?', [username, email, id]);
    return findById(id);
  }
  const result = await conn.pool.request()
    .input('id', conn.sql.Int, id)
    .input('username', conn.sql.NVarChar, username)
    .input('email', conn.sql.NVarChar, email)
    .query(`UPDATE Users SET Username = @username, Email = @email OUTPUT INSERTED.UserID, INSERTED.Username, INSERTED.Email, INSERTED.CreatedAt WHERE UserID = @id`);
  return result.recordset[0];
}

async function updatePassword(id, passwordHash) {
  const conn = await getPool();
  if (isSqlite(conn) || isMysql(conn)) {
    await execute(conn, 'UPDATE Users SET PasswordHash = ? WHERE UserID = ?', [passwordHash, id]);
    return true;
  }
  await conn.pool.request()
    .input('id', conn.sql.Int, id)
    .input('passwordHash', conn.sql.NVarChar, passwordHash)
    .query('UPDATE Users SET PasswordHash = @passwordHash WHERE UserID = @id');
  return true;
}

module.exports = { findByEmail, findByUsername, findById, findAuthById, create, updateProfile, updatePassword };
