const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Pages
router.get('/signup', redirectIfAuthenticated, authController.showSignUp);
router.get('/signin', redirectIfAuthenticated, authController.showSignIn);

// Auth actions
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/logout', authController.logout);

module.exports = router;
