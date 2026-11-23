const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'modern-auth-secret-key-2026-swastik-lab',
  DB_PATH: path.join(__dirname, '../../database.sqlite'),
  BCRYPT_SALT_ROUNDS: 10
};
