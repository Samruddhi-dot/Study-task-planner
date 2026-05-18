require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const taskController = require('./controllers/taskController');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ======================
// DEBUG
// ======================
console.log("JWT_SECRET =", process.env.JWT_SECRET);

// ======================
// VIEW ENGINE
// ======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// HOME
// ======================
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Study Planner'
  });
});

// ======================
// AUTH MIDDLEWARE
// ======================
const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) return res.redirect('/auth/signin');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.log("Auth error:", err.message);
    return res.redirect('/auth/signin');
  }
};

// ======================
// ROUTES
// ======================
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// ✅ SINGLE CLEAN DASHBOARD ROUTE
app.get('/dashboard', requireAuth, taskController.showDashboard);

// ======================
// FAVICON
// ======================
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// ======================
// ERROR HANDLING
// ======================
app.use(notFound);
app.use(errorHandler);

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
