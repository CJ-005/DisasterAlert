const userService = require('../services/userService');
const { AppError } = require('../utils/AppError');

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name } = req.body;
    const user = await userService.updateMe(req.user.id, { name });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }
    const result = await userService.updatePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const user = await userService.deactivate(req.user.id);
    res.json({ message: 'Account deactivated', user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  updateMe,
  updatePassword,
  deactivate,
};
