const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

// ======================
// PAGE ROUTES
// ======================
router.get('/signup', redirectIfAuthenticated, authController.showSignUp);
router.get('/signin', redirectIfAuthenticated, authController.showSignIn);

// ======================
// AUTH ACTIONS
// ======================
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/logout', authController.logout);

module.exports = router;
