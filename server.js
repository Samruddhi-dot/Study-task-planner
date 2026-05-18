require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { supabaseAdmin } = require('./config/supabase');

const app = express();

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
// AUTH MIDDLEWARE
// ======================
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/signin');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect('/auth/signin');
  }
};

// ======================
// DASHBOARD (FIXED)
// ======================
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', req.user.id)
      .single();

    // 🚨 IMPORTANT: handle Supabase error
    if (error || !user) {
      console.log("Supabase error:", error);
      return res.redirect('/auth/signin');
    }

    return res.render('dashboard', {
      user,
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
        overdue: 0
      },
      tasks: [],
      subjects: []
    });

  } catch (err) {
    console.log("Dashboard crash:", err);
    return res.redirect('/auth/signin');
  }
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
