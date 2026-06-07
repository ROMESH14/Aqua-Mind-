const { getPool, isSqlite } = require('../config/db');

async function findByEmail(email) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT * FROM Users WHERE Email = ?').get(email);
  }
  const result = await conn.pool.request()
    .input('email', conn.sql.NVarChar, email)
    .query('SELECT * FROM Users WHERE Email = @email');
  return result.recordset[0];
}

async function findByUsername(username) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT * FROM Users WHERE Username = ?').get(username);
  }
  const result = await conn.pool.request()
    .input('username', conn.sql.NVarChar, username)
    .query('SELECT * FROM Users WHERE Username = @username');
  return result.recordset[0];
}

async function findById(id) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    return conn.db.prepare('SELECT UserID, Username, Email, CreatedAt FROM Users WHERE UserID = ?').get(id);
  }
  const result = await conn.pool.request()
    .input('id', conn.sql.Int, id)
    .query('SELECT UserID, Username, Email, CreatedAt FROM Users WHERE UserID = @id');
  return result.recordset[0];
}

async function create({ username, email, passwordHash }) {
  const conn = await getPool();
  if (isSqlite(conn)) {
    const stmt = conn.db.prepare('INSERT INTO Users (Username, Email, PasswordHash) VALUES (?, ?, ?)');
    const info = stmt.run(username, email, passwordHash);
    return conn.db.prepare('SELECT UserID, Username, Email, CreatedAt FROM Users WHERE UserID = ?').get(info.lastInsertRowid);
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

module.exports = { findByEmail, findByUsername, findById, create };
