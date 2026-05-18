require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

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
// HOME PAGE
// ======================
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Study Planner'
  });
});

// ======================
// ROUTES
// ======================
app.use('/auth', authRoutes);
app.use('/', taskRoutes);

// ======================
// DASHBOARD (PROTECTED VERSION)
// ======================
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/signin');
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect('/auth/signin');
  }
};

app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', {
    user: {
      id: req.user.id
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

// ======================
// FAVICON FIX
// ======================
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// ======================
// ERROR HANDLERS
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
