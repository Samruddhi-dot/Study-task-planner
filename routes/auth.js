// routes/auth.js
// =============================================
// Authentication Routes
// =============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

// --- Page Routes (GET) ---
// Show signup page (redirect to dashboard if already logged in)
router.get('/signup', redirectIfAuthenticated, authController.showSignUp);

// Show signin page (redirect to dashboard if already logged in)
router.get('/signin', redirectIfAuthenticated, authController.showSignIn);

// --- API Routes (POST) ---
// Register a new user
// Endpoint: POST /auth/signup
// Body: { name, email, password, confirmPassword }
router.post('/signup', authController.signUp);

// Log in an existing user
// Endpoint: POST /auth/signin
// Body: { email, password }
router.post('/signin', authController.signIn);

// Log out (clears cookie)
// Endpoint: POST /auth/logout
router.post('/logout', authController.logout);

module.exports = router;
