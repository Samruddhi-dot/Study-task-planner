const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// SHOW PAGES
const showSignUp = (req, res) => {
  res.render('signup', {
    title: 'Study Planner',
    error: null,
    success: null
  });
};

const showSignIn = (req, res) => {
  res.render('signin', {
    title: 'Study Planner',
    error: null,
    message: null
  });
};

// AUTH ACTIONS
const signUp = async (req, res) => {
  res.json({
    success: true,
    message: 'signup working'
  });
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('signin', {
        title: 'Study Planner',
        error: 'Email and password are required',
        message: null
      });
    }

    // 1. Get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.render('signin', {
        title: 'Study Planner',
        error: 'User not found',
        message: null
      });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('signin', {
        title: 'Study Planner',
        error: 'Invalid password',
        message: null
      });
    }

    // 3. Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Set cookie (IMPORTANT FIX)
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,   // localhost only
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    console.log("LOGIN SUCCESS - COOKIE SET");

    // 5. Redirect
    return res.redirect('/');

  } catch (err) {
    console.log("SignIn Error:", err);
    return res.status(500).send('Server error');
  }
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
