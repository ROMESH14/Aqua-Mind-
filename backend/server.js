const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const { getPool, isSqlite } = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AquaMind API is running!' });
});

app.get('/api/health', async (req, res) => {
  try {
    const conn = await getPool();
    if (isSqlite(conn)) {
      conn.db.prepare('SELECT 1').get();
      return res.json({ status: 'ok', database: 'sqlite', driver: 'sqlite' });
    }
    res.json({ status: 'ok', database: 'connected', driver: 'mssql' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

app.use('/api', apiRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const driver = process.env.DB_DRIVER || 'sqlite';
  console.log(`Server running on port ${PORT} (${driver})`);
});
