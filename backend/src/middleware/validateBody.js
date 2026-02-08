const { AppError } = require('../utils/AppError');

function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body;
    if (body === undefined || body === null) {
      return next(new AppError('Request body is required', 400));
    }
    if (typeof body !== 'object') {
      return next(new AppError('Request body must be a JSON object', 400));
    }
    for (const [key, rules] of Object.entries(schema)) {
      const value = body[key];
      if (rules.required && (value === undefined || value === null)) {
        return next(new AppError(`${key} is required`, 400));
      }
      if (value === undefined || value === null) continue;
      if (rules.type && typeof value !== rules.type) {
        return next(new AppError(`${key} must be ${rules.type}`, 400));
      }
      if (rules.maxLength && String(value).length > rules.maxLength) {
        return next(new AppError(`${key} must be at most ${rules.maxLength} characters`, 400));
      }
      if (rules.enum && !rules.enum.includes(value)) {
        return next(new AppError(`${key} must be one of: ${rules.enum.join(', ')}`, 400));
      }
    }
    next();
  };
}

module.exports = { validateBody };
