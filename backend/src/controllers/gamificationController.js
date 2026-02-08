const gamificationService = require('../services/gamificationService');

async function getMe(req, res, next) {
  try {
    const data = await gamificationService.getMe(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
};
