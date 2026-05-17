// middleware/auth.js
// =============================================
// Authentication Middleware
// =============================================
// This middleware protects routes by verifying JWT tokens.
// It runs BEFORE the route handler on protected routes.

const jwt = require('jsonwebtoken');

/**
 * Middleware to protect API routes (returns JSON errors)
 * Use this for API endpoints like /tasks
 */
const requireAuth = (req, res, next) => {
  try {
    // Look for token in multiple places:
    // 1. HTTP-only cookie (most secure, set by our login route)
    // 2. Authorization header (for API clients like Postman)
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }

    // If no token found anywhere, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in first.'
      });
    }

    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request so route handlers can use it
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.'
    });
  }
};

/**
 * Middleware to protect PAGE routes (redirects to login page)
 * Use this for HTML pages like the dashboard
 */
const requireAuthPage = (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      // Redirect to login page instead of returning JSON error
      return res.redirect('/auth/signin?message=Please log in to access your planner');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Clear invalid cookie and redirect
    res.clearCookie('token');
    return res.redirect('/auth/signin?message=Session expired. Please log in again.');
  }
};

/**
 * Middleware to redirect logged-in users away from auth pages
 * Prevents logged-in users from seeing the login/signup pages
 */
const redirectIfAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET);
      // Token is valid - user is already logged in
      return res.redirect('/dashboard');
    }
    next();
  } catch (error) {
    // Token invalid - clear it and show the page
    res.clearCookie('token');
    next();
  }
};

module.exports = { requireAuth, requireAuthPage, redirectIfAuthenticated };
