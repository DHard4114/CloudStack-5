const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env      = require('../config/env');
const R        = require('../utils/response.util');
const userRepo = require('../repositories/user.repository');

async function register(req, res, next) {
  try {
    const { username, email, password, role = 'student' } = req.body;
    if (!username || !email || !password)
      return R.badRequest(res, 'username, email, dan password wajib diisi.');
    if (!['teacher', 'student'].includes(role))
      return R.badRequest(res, 'Role hanya boleh: teacher atau student.');
    if (password.length < 8)
      return R.badRequest(res, 'Password minimal 8 karakter.');

    const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
    const uuid         = uuidv4();
    await userRepo.create({ uuid, username, email, passwordHash, role });
    return R.created(res, { uuid, username, email, role }, 'Registrasi berhasil.');
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return R.badRequest(res, 'Email dan password wajib diisi.');

    const user = await userRepo.findByEmail(email);
    if (!user) return R.unauthorized(res, 'Email atau password salah.');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return R.unauthorized(res, 'Email atau password salah.');

    await userRepo.updateLastLogin(user.id);
    const token = jwt.sign(
      { id: user.id, uuid: user.uuid, role: user.role },
      env.jwt.secret, { expiresIn: env.jwt.expiresIn }
    );
    return R.ok(res, { token, user: { uuid: user.uuid, username: user.username, role: user.role } }, 'Login berhasil.');
  } catch (err) { next(err); }
}

module.exports = { register, login };
