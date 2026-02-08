const healthService = require('../services/healthService');

async function getHealth(req, res, next) {
  try {
    const data = await healthService.getHealth();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHealth,
};
