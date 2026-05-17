const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// SHOW PAGES
const showSignUp = (req, res) => {
  res.render('signup');
};

const showSignIn = (req, res) => {
  res.render('signin');
};

// AUTH ACTIONS
const signUp = async (req, res) => {
  res.send('signup working');
};

const signIn = async (req, res) => {
  res.send('signin working');
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/signin');
};

module.exports = {
  showSignUp,
  showSignIn,
  signUp,
  signIn,
  logout
};
