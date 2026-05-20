const pool = require('../config/database');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, uuid, username, role, password_hash
     FROM users WHERE email = ? AND deleted_at IS NULL`, [email]);
  return rows[0] || null;
}

async function create({ uuid, username, email, passwordHash, role }) {
  await pool.execute(
    `INSERT INTO users (uuid, username, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`, [uuid, username, email, passwordHash, role]);
}

async function updateLastLogin(id) {
  await pool.execute(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [id]);
}

module.exports = { findByEmail, create, updateLastLogin };
