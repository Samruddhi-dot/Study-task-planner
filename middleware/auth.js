const jwt = require('jsonwebtoken');

// Protect API routes
const requireAuth = (req, res, next) => {
  try {
    let token =
      req.cookies?.token ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in first.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Protect page routes (EJS pages)
const requireAuthPage = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect('/auth/signin');
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/signin');
  }
};

// Redirect logged-in users away from login pages
const redirectIfAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/dashboard');
    }

    next();
  } catch (error) {
    res.clearCookie('token');
    next();
  }
};

module.exports = {
  requireAuth,
  requireAuthPage,
  redirectIfAuthenticated
};
