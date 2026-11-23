const fs = require('fs');
const path = require('path');
const authService = require('../services/authService');

const VIEWS_DIR = path.join(__dirname, '../../views');

// Helper to render HTML view with template variable injection
function renderView(res, viewFileName, variables = {}) {
  const filePath = path.join(VIEWS_DIR, viewFileName);
  fs.readFile(filePath, 'utf8', (err, htmlContent) => {
    if (err) {
      console.error('[-] Error reading view file:', err);
      return res.status(500).send('Internal Server Error loading page template.');
    }

    let rendered = htmlContent;
    for (const [key, val] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, val !== undefined && val !== null ? String(val) : '');
    }

    // Clear any unreplaced tokens
    rendered = rendered.replace(/{{[A-Z0-9_]+}}/g, '');
    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  });
}

class AuthController {
  /**
   * GET /login
   */
  showLoginPage(req, res) {
    if (req.session && req.session.user) {
      return res.redirect('/success');
    }

    const errorMessage = req.query.error || '';
    const successMessage = req.query.success || '';

    renderView(res, 'login.html', {
      ERROR_MESSAGE: errorMessage
        ? `<div class="alert alert-error" role="alert"><span class="alert-icon">⚠️</span> <div><strong>Validation Failed:</strong> ${errorMessage}</div></div>`
        : '',
      SUCCESS_MESSAGE: successMessage
        ? `<div class="alert alert-success" role="status"><span class="alert-icon">✓</span> <div>${successMessage}</div></div>`
        : '',
      USERNAME: req.query.username || ''
    });
  }

  /**
   * POST /login
   */
  async handleLogin(req, res) {
    const { username, password } = req.body;

    const validationResult = await authService.validateCredentials(username, password);

    if (!validationResult.success) {
      // Return login page with error message (per prompt requirement)
      return renderView(res, 'login.html', {
        ERROR_MESSAGE: `<div class="alert alert-error" role="alert"><span class="alert-icon">⚠️</span> <div><strong>Login Failed:</strong> ${validationResult.message}</div></div>`,
        SUCCESS_MESSAGE: '',
        USERNAME: username || ''
      });
    }

    // Save user state in session
    req.session.user = validationResult.user;
    req.session.loginTime = new Date().toLocaleTimeString();

    // Return successful login page
    return res.redirect('/success');
  }

  /**
   * GET /success (Successful Login Page)
   */
  showSuccessPage(req, res) {
    if (!req.session || !req.session.user) {
      return res.redirect('/login?error=Access%20denied.%20Please%20log%20in%20first.');
    }

    const user = req.session.user;
    renderView(res, 'success.html', {
      FULL_NAME: user.fullName,
      USERNAME: user.username,
      ROLE: user.role,
      MEMBER_SINCE: new Date(user.memberSince).toLocaleDateString(),
      LOGIN_TIME: req.session.loginTime || new Date().toLocaleTimeString(),
      SESSION_ID: req.sessionID ? req.sessionID.substring(0, 16) + '...' : 'active-session'
    });
  }

  /**
   * GET /register
   */
  showRegisterPage(req, res) {
    renderView(res, 'register.html', {
      ERROR_MESSAGE: '',
      SUCCESS_MESSAGE: ''
    });
  }

  /**
   * POST /register
   */
  async handleRegister(req, res) {
    const { username, password, fullName, role } = req.body;
    const result = await authService.registerUser(username, password, fullName, role);

    if (!result.success) {
      return renderView(res, 'register.html', {
        ERROR_MESSAGE: `<div class="alert alert-error" role="alert"><span class="alert-icon">⚠️</span> <div>${result.message}</div></div>`,
        SUCCESS_MESSAGE: ''
      });
    }

    return res.redirect(`/login?success=Account%20created%20successfully!%20Please%20log%20in.&username=${encodeURIComponent(username)}`);
  }

  /**
   * POST /logout or GET /logout
   */
  handleLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('[-] Error destroying session:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/login?success=You%20have%20been%20safely%20logged%20out.');
    });
  }
}

module.exports = new AuthController();
