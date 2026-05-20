const jwt = require('jsonwebtoken');
const env  = require('../config/env');
const R    = require('../utils/response.util');

function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return R.unauthorized(res, 'Token tidak ditemukan.');
  try {
    req.user = jwt.verify(token, env.jwt.secret);
    next();
  } catch {
    return R.forbidden(res, 'Token tidak valid atau sudah expired.');
  }
}

function requireTeacher(req, res, next) {
  if (!['teacher', 'super_admin'].includes(req.user?.role))
    return R.forbidden(res, 'Akses ditolak. Hanya guru.');
  next();
}

module.exports = { requireAuth, requireTeacher };
