// middleware/errorHandler.js
// =============================================
// Global Error Handling Middleware
// =============================================
// Express calls this automatically when next(error) is called
// or when an unhandled error occurs in a route

/**
 * Global error handler - must have 4 parameters for Express to recognize it
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details for debugging
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Default error values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed: ' + err.message;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  // Check if the request expects JSON (API call) or HTML (page visit)
  const wantsJson = req.path.startsWith('/api') ||
                    req.path.startsWith('/tasks') ||
                    req.path.startsWith('/auth') ||
                    req.headers.accept?.includes('application/json');

  if (wantsJson) {
    return res.status(statusCode).json({
      success: false,
      message,
      // Only show stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // For page requests, render an error page
  return res.status(statusCode).render('error', {
    title: 'Error',
    statusCode,
    message,
    user: req.user || null
  });
};

/**
 * 404 Handler - catches requests to routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new Error(`Page not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
