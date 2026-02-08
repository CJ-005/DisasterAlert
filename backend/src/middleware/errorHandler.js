const logger = require('../lib/logger');

function globalErrorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (message === 'Not allowed by CORS') statusCode = 403;

  logger.error(message, {
    statusCode,
    path: req.path,
    method: req.method,
    ...(err.stack && { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { globalErrorHandler };
