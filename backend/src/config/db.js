const DB_DRIVER = process.env.DB_DRIVER || 'sqlite';

let pool = null;
let sqliteDb = null;

async function getPool() {
  if (DB_DRIVER === 'sqlite') {
    if (!sqliteDb) {
      sqliteDb = require('./sqlite');
    }
    return { driver: 'sqlite', db: sqliteDb };
  }

  const sql = require('mssql');
  const config = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_DATABASE || 'AquaMindDB',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true,
      trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true',
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  };

  if (process.env.DB_USER && process.env.DB_PASSWORD) {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    config.options.trustedConnection = false;
  }

  if (!pool) pool = await sql.connect(config);
  return { driver: 'mssql', pool, sql };
}

function isSqlite(conn) {
  return conn.driver === 'sqlite';
}

module.exports = { getPool, isSqlite };
