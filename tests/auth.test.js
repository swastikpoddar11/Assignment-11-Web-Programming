const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeDatabase, query } = require('../src/db/database');
const authService = require('../src/services/authService');

test.before(async () => {
  // Ensure DB schema and seed data are ready
  await initializeDatabase();
});

test('Authentication Test Suite - Security & Credential Validation', async (t) => {
  await t.test('1. Valid Admin credentials should authenticate successfully', async () => {
    const result = await authService.validateCredentials('swastik_admin', 'Password@123');
    assert.strictEqual(result.success, true);
    assert.ok(result.user, 'User object should be returned');
    assert.strictEqual(result.user.username, 'swastik_admin');
    assert.strictEqual(result.user.role, 'Administrator');
    assert.strictEqual(result.user.password_hash, undefined, 'password_hash must never be exposed');
  });

  await t.test('2. Valid Standard Engineer credentials should authenticate successfully', async () => {
    const result = await authService.validateCredentials('john_doe', 'SecurePass#2026');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.user.username, 'john_doe');
    assert.strictEqual(result.user.fullName, 'John Doe');
  });

  await t.test('3. Incorrect password should fail validation with safe error message', async () => {
    const result = await authService.validateCredentials('swastik_admin', 'WrongPassword!999');
    assert.strictEqual(result.success, false);
    assert.match(result.message, /invalid username or password/i);
    assert.strictEqual(result.user, undefined);
  });

  await t.test('4. Non-existent user should fail validation with uniform error message', async () => {
    const result = await authService.validateCredentials('ghost_user_does_not_exist', 'SomeSecret123');
    assert.strictEqual(result.success, false);
    assert.match(result.message, /invalid username or password/i);
  });

  await t.test('5. SQL Injection payload in username should be neutralized by parameterized query', async () => {
    const injectionAttempts = [
      "' OR '1'='1",
      "swastik_admin' --",
      "admin' /*",
      "' UNION SELECT 1, 'admin', 'hash' --"
    ];

    for (const payload of injectionAttempts) {
      const result = await authService.validateCredentials(payload, 'any_password');
      assert.strictEqual(result.success, false, `SQL Injection payload "${payload}" must not bypass auth`);
    }
  });

  await t.test('6. Empty username or password must fail validation', async () => {
    const emptyUser = await authService.validateCredentials('', 'Password@123');
    assert.strictEqual(emptyUser.success, false);

    const emptyPass = await authService.validateCredentials('swastik_admin', '');
    assert.strictEqual(emptyPass.success, false);
  });

  await t.test('7. New user registration and subsequent login verification', async () => {
    const testUser = `test_engineer_${Date.now()}`;
    const testPass = 'SuperSecret!456';

    const regResult = await authService.registerUser(testUser, testPass, 'Test User', 'QA Engineer');
    assert.strictEqual(regResult.success, true);

    const loginResult = await authService.validateCredentials(testUser, testPass);
    assert.strictEqual(loginResult.success, true);
    assert.strictEqual(loginResult.user.username, testUser);
    assert.strictEqual(loginResult.user.role, 'QA Engineer');
  });
});
