const authService = require('../services/authService');
const { AppError } = require('../utils/AppError');

async function register(req, res, next) {
  try {
    const { name, email, password, role, agencyId } = req.body;
    if (!name || !email || !password) {
      return next(new AppError('Name, email and password are required', 400));
    }
    const result = await authService.register({ name, email, password, role, agencyId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
};
