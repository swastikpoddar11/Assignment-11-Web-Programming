const express = require('express');
const session = require('express-session');
const path = require('path');
const config = require('./src/config/config');
const { initializeDatabase } = require('./src/db/database');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Middleware: Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware: Static files (CSS, JS, Assets)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Session management
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);

// Mount application routes
app.use('/', authRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h2>404 - Page Not Found</h2>
      <p><a href="/login">Return to Login</a></p>
    </div>
  `);
});

// Server Initialization
async function startServer() {
  try {
    await initializeDatabase();
    const server = app.listen(config.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 User Validation Server running on http://localhost:${config.PORT}`);
      console.log(`🔑 Login endpoint: http://localhost:${config.PORT}/login`);
      console.log(`====================================================`);
    });
    return server;
  } catch (error) {
    console.error('[-] Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
