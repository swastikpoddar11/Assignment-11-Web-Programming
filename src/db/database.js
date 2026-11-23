const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('[-] Failed to connect to SQLite database:', err.message);
  } else {
    console.log('[+] Connected to SQLite database at:', config.DB_PATH);
  }
});

// Wrap sqlite3 queries with Promises for modern async/await syntax
const query = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};

/**
 * Initialize DB schema and seed initial users with bcrypt hashes
 */
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'User',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await query.run(createTableQuery);

  // Check if seed users exist
  const existingUsers = await query.all('SELECT username FROM users');
  if (existingUsers.length === 0) {
    console.log('[*] Seeding database with initial authorized users...');

    const seedUsers = [
      {
        username: 'swastik_admin',
        password: 'Password@123',
        full_name: 'Swastik Admin',
        role: 'Administrator'
      },
      {
        username: 'john_doe',
        password: 'SecurePass#2026',
        full_name: 'John Doe',
        role: 'Senior Software Engineer'
      }
    ];

    for (const user of seedUsers) {
      const passwordHash = await bcrypt.hash(user.password, config.BCRYPT_SALT_ROUNDS);
      await query.run(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        [user.username, passwordHash, user.full_name, user.role]
      );
    }
    console.log('[+] Seeding completed successfully. Test accounts created.');
  }
}

module.exports = {
  db,
  query,
  initializeDatabase
};
