const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Pages
router.get('/signup', redirectIfAuthenticated, authController.showSignup);
router.get('/signin', redirectIfAuthenticated, authController.showSignin);

// Auth APIs
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/logout', authController.logout);

module.exports = router;
