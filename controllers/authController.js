const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// ======================
// SHOW PAGES
// ======================
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

// ======================
// SIGN UP (TEMP - you can extend later)
// ======================
const signUp = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Signup working"
  });
};

// ======================
// SIGN IN (FIXED)
// ======================
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,   // localhost only
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    console.log("LOGIN SUCCESS - COOKIE SET");

    // Send JSON response (IMPORTANT for fetch)
    return res.status(200).json({
      success: true,
      message: "Login successful"
    });

  } catch (err) {
    console.log("SignIn Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ======================
// LOGOUT
// ======================
const logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/auth/signin');
};

// ======================
// EXPORTS
// ======================
module.exports = {
  showSignUp,
  showSignIn,
  signUp,
  signIn,
  logout
};
