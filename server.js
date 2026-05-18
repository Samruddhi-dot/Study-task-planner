// server.js
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Home page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Study Planner'
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/', taskRoutes);

// Dashboard route ← ADD THIS
app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    user: {
      name: 'Samruddhi',
      email: 'test@example.com'
    },
    stats: {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0
    },
    tasks: [],
    subjects: []
  });
});

// Fix favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
