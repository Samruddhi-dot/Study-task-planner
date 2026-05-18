// controllers/authController.js
// =============================================
// Authentication Controller
// =============================================
// Handles all authentication logic:
// - Sign Up (create new account)
// - Sign In (login)
// - Logout

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper: Generate a JWT token for a user
 * The token contains the user's ID and email
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Helper: Set token as HTTP-only cookie
 * HTTP-only cookies can't be accessed by JavaScript (prevents XSS attacks)
 */
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,           // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',       // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

// =============================================
// SHOW PAGES (GET requests)
// =============================================

/** Show the Sign Up page */
exports.showSignUp = (req, res) => {
  res.render('signup', {
    title: 'Create Account',
    error: req.query.error || null,
    success: req.query.success || null
  });
};

/** Show the Sign In page */
exports.showSignIn = (req, res) => {
  res.render('signin', {
    title: 'Sign In',
    error: req.query.error || null,
    message: req.query.message || null
  });
};

// =============================================
// AUTH ACTIONS (POST requests)
// =============================================

/**
 * POST /auth/signup
 * Create a new user account
 */
exports.signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // --- Input Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // --- Check if email already exists ---
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // --- Hash the password ---
    // bcrypt automatically adds a "salt" to prevent rainbow table attacks
    // The number 12 is the "cost factor" - higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 12);

    // --- Save user to database ---
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword
      }])
      .select('id, name, email, created_at')
      .single();

    if (error) {
      console.error('Database error during signup:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create account. Please try again.'
      });
    }

    // --- Generate JWT and set cookie ---
    const token = generateToken(newUser);
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token // Also return token in response body for API clients
    });

  } catch (error) {
    console.error('Sign up error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * POST /auth/signin
 * Log in an existing user
 */
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Input Validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // --- Find user by email ---
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, password')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Use a generic error message to avoid revealing whether email exists
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // --- Verify password ---
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // --- Generate JWT and set cookie ---
    const token = generateToken(user);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully!',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });

  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * POST /auth/logout
 * Clear the authentication cookie
 */
exports.logout = (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
