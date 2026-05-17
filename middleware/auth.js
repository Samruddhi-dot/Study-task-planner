const jwt = require('jsonwebtoken');

// Protect routes (require login)
const protect = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Redirect logged-in users away from signin/signup pages
const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies?.token;

  if (token) {
    return res.redirect('/');
  }

  next();
};

module.exports = {
  protect,
  redirectIfAuthenticated
};
