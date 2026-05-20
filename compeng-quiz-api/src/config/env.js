require('dotenv').config();

const REQUIRED_VARS = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'JWT_SECRET', 'BCRYPT_ROUNDS',
];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    console.error(`[CONFIG] FATAL: "${key}" belum diset di .env`);
    process.exit(1);
  }
}

const env = {
  port         : parseInt(process.env.PORT) || 3000,
  nodeEnv      : process.env.NODE_ENV || 'development',
  db: {
    host           : process.env.DB_HOST,
    port           : parseInt(process.env.DB_PORT) || 3306,
    user           : process.env.DB_USER,
    password       : process.env.DB_PASSWORD,
    name           : process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
  },
  jwt: {
    secret   : process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  bcryptRounds : parseInt(process.env.BCRYPT_ROUNDS) || 12,
};

module.exports = env;
