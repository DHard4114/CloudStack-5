const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message : { success: false, error: 'Terlalu banyak percobaan. Coba 15 menit lagi.' },
  standardHeaders: true, legacyHeaders: false,
});

const joinLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10,
  message : { success: false, error: 'Terlalu banyak percobaan. Tunggu 1 menit.' },
  standardHeaders: true, legacyHeaders: false,
});

module.exports = { loginLimiter, joinLimiter };
