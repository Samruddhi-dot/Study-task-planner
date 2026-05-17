// server.js
// =============================================
// Study Planner - Main Server File
// =============================================
// This is the entry point of the application.
// It sets up Express, connects middleware, and starts the server.

// Load environment variables FIRST (before any other imports)
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import our custom routes and middleware
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Create Express application
const app = express();

// =============================================
// VIEW ENGINE SETUP
// =============================================
// EJS allows us to embed JavaScript in HTML templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =============================================
// MIDDLEWARE
// =============================================
// Parse incoming JSON request bodies (for API calls)
app.use(express.json());

// Parse URL-encoded form data (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Parse cookies (needed for JWT token storage)
app.use(cookieParser());

// Serve static files (CSS, JavaScript, images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// ROUTES
// =============================================

// Home page
app.get('/', (req, res) => {
  res.render('index', { title: 'Study Planner - Organize Your Learning' });
});

// Authentication routes (/auth/signup, /auth/signin, /auth/logout)
app.use('/auth', authRoutes);

// Task and dashboard routes (/tasks, /dashboard)
app.use('/', taskRoutes);

// =============================================
// ERROR HANDLING
// =============================================
// 404 handler - catches requests to undefined routes
app.use(notFound);

// Global error handler - catches all errors
app.use(errorHandler);

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🎓 ================================');
  console.log('   Study Planner is running!');
  console.log('🎓 ================================');
  console.log(`   🌐 URL: http://localhost:${PORT}`);
  console.log(`   📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('   Available pages:');
  console.log(`   → Home:      http://localhost:${PORT}/`);
  console.log(`   → Sign Up:   http://localhost:${PORT}/auth/signup`);
  console.log(`   → Sign In:   http://localhost:${PORT}/auth/signin`);
  console.log(`   → Dashboard: http://localhost:${PORT}/dashboard`);
  console.log('');
  console.log('   API Endpoints:');
  console.log(`   → POST   /auth/signup`);
  console.log(`   → POST   /auth/signin`);
  console.log(`   → POST   /auth/logout`);
  console.log(`   → GET    /tasks`);
  console.log(`   → POST   /tasks`);
  console.log(`   → PUT    /tasks/:id`);
  console.log(`   → DELETE /tasks/:id`);
  console.log(`   → PATCH  /tasks/:id/complete`);
  console.log('================================');
});

module.exports = app;
