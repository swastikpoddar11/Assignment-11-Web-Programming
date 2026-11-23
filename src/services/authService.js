const bcrypt = require('bcryptjs');
const { query } = require('../db/database');
const config = require('../config/config');

class AuthService {
  /**
   * Validates user credentials against the database.
   * Uses parameterized queries to prevent SQL Injection and
   * bcrypt for constant-time cryptographic password verification.
   *
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<{success: boolean, message?: string, user?: object}>}
   */
  async validateCredentials(username, password) {
    // 1. Input Validation
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required fields.'
      };
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      return {
        success: false,
        message: 'Username must be between 3 and 50 characters.'
      };
    }

    try {
      // 2. Fetch user using parameterized SQL query (Immune to SQL Injection)
      const user = await query.get(
        'SELECT id, username, password_hash, full_name, role, created_at FROM users WHERE username = ?',
        [trimmedUsername]
      );

      // Generic authentication failure message to prevent Account Enumeration attacks
      const invalidCredentialsMessage = 'Invalid username or password. Please verify your credentials and try again.';

      if (!user) {
        // Run a dummy bcrypt comparison to defend against timing attacks
        await bcrypt.compare(password, '$2a$10$DummyHashToMitigateTimingAttacks000000000000000000000');
        return {
          success: false,
          message: invalidCredentialsMessage
        };
      }

      // 3. Cryptographically verify password against bcrypt hash
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        return {
          success: false,
          message: invalidCredentialsMessage
        };
      }

      // 4. Return sanitized user object (never expose password_hash)
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          memberSince: user.created_at
        }
      };
    } catch (error) {
      console.error('[-] Error during credential validation:', error);
      return {
        success: false,
        message: 'An internal server error occurred while processing authentication.'
      };
    }
  }

  /**
   * Registers a new user account with secure password hashing.
   */
  async registerUser(username, password, fullName, role = 'User') {
    if (!username || !password || !fullName) {
      return { success: false, message: 'All fields are required.' };
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
      const existing = await query.get('SELECT id FROM users WHERE username = ?', [trimmedUsername]);
      if (existing) {
        return { success: false, message: 'Username is already taken.' };
      }

      const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
      const result = await query.run(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        [trimmedUsername, passwordHash, fullName.trim(), role]
      );

      return {
        success: true,
        userId: result.lastID,
        message: 'Account successfully registered! You can now log in.'
      };
    } catch (error) {
      console.error('[-] Error during user registration:', error);
      return { success: false, message: 'Failed to create user account.' };
    }
  }

  /**
   * Fetches user by ID from the database.
   */
  async getUserById(id) {
    const user = await query.get(
      'SELECT id, username, full_name, role, created_at FROM users WHERE id = ?',
      [id]
    );
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      memberSince: user.created_at
    };
  }
}

module.exports = new AuthService();
