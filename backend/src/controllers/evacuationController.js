const evacuationSimulateService = require('../services/evacuationSimulateService');

async function simulate(req, res, next) {
  try {
    const { lat, lng } = req.body;
    const result = await evacuationSimulateService.simulate(lat, lng);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  simulate,
};
