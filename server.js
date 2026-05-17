require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// ✅ IMPORTS MUST COME FIRST
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/auth', authRoutes);
app.use('/', taskRoutes);

// error handling (LAST)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
