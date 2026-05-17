const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.get('/signin', authController.showSignin);
router.post('/signin', authController.signin);

router.get('/signup', authController.showSignup);
router.post('/signup', authController.signup);

router.post('/logout', authController.logout);

module.exports = router;
