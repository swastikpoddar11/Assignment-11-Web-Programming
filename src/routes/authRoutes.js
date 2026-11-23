const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Home redirects to login
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Authentication routes
router.get('/login', authController.showLoginPage);
router.post('/login', authController.handleLogin);

// Protected success page
router.get('/success', authController.showSuccessPage);

// User registration routes
router.get('/register', authController.showRegisterPage);
router.post('/register', authController.handleRegister);

// Logout route
router.get('/logout', authController.handleLogout);
router.post('/logout', authController.handleLogout);

module.exports = router;
