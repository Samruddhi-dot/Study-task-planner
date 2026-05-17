require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// =====================
// IMPORT ROUTES (MUST BE FIRST)
// =====================
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// =====================
const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// VIEWS
// =====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================
// ROUTES
// =====================
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/auth', authRoutes);
app.use('/', taskRoutes);

// =====================
// ERROR HANDLERS (LAST)
// =====================
app.use(notFound);
app.use(errorHandler);

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
