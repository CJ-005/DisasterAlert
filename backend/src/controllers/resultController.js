const resultService = require('../services/resultService');

async function listMy(req, res, next) {
  try {
    const items = await resultService.listByUser(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function listByAssessment(req, res, next) {
  try {
    const items = await resultService.listByAssessment(req.params.assessmentId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await resultService.getById(req.params.id, req.user?.id, req.user?.role);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMy,
  listByAssessment,
  getById,
};
