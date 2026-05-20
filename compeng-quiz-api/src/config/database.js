const mysql = require('mysql2/promise');
const env   = require('./env');

const pool = mysql.createPool({
  host              : env.db.host,
  port              : env.db.port,
  user              : env.db.user,
  password          : env.db.password,
  database          : env.db.name,
  connectionLimit   : env.db.connectionLimit,
  waitForConnections: true,
  queueLimit        : 0,
  multipleStatements: false,
  typeCast          : true,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log(`[DB] Connected → ${env.db.name}@${env.db.host}`);
    conn.release();
  } catch (err) {
    console.error('[DB] FATAL: Koneksi MySQL gagal:', err.message);
    process.exit(1);
  }
}
testConnection();

module.exports = pool;
