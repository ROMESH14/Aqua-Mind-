const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const { getPool, isSqlite, isMysql } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AquaMind API is running!' });
});

app.get('/api/health', async (req, res) => {
  const driver = process.env.DB_DRIVER || 'sqlite';
  const payload = {
    api: 'running',
    driver,
    port: Number(PORT),
    status: 'ok',
    database: 'connected',
  };

  const withTimeout = (promise, ms) => Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database check timed out — open WAMP and start MySQL')), ms);
    }),
  ]);

  try {
    const conn = await withTimeout(getPool(), 4000);
    if (isSqlite(conn)) {
      conn.db.prepare('SELECT 1').get();
      payload.database = 'sqlite';
      return res.json(payload);
    }
    if (isMysql(conn)) {
      await conn.pool.query('SELECT 1');
      payload.database = process.env.DB_DATABASE || 'myaqua';
      return res.json(payload);
    }
    return res.json(payload);
  } catch (err) {
    return res.json({
      ...payload,
      status: 'degraded',
      database: 'disconnected',
      message: err.message,
      hint: 'Open WAMP (green icon in taskbar) → Start MySQL, then refresh this page.',
    });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'AquaMind API is reachable' });
});

app.use('/api', apiRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  const driver = process.env.DB_DRIVER || 'sqlite';
  console.log(`Server running on port ${PORT} (${driver})`);
});
