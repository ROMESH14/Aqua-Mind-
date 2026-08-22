/**
 * Creates all Aqua Mind tables in MySQL (uses backend/.env).
 * Usage: node scripts/init-mysql.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { getMysqlPool } = require('../src/config/mysql');

async function main() {
  const pool = await getMysqlPool();
  const [tables] = await pool.query('SHOW TABLES');
  console.log(`Connected to MySQL database: ${process.env.DB_DATABASE || 'aquamind'}`);
  console.log('Tables:', tables.map((row) => Object.values(row)[0]).join(', ') || '(none)');
  console.log('All tables ready.');
  await pool.end();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
