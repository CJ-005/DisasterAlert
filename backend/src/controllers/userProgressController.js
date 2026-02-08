const userProgressService = require('../services/userProgressService');

async function getByUser(req, res, next) {
  try {
    const items = await userProgressService.getByUser(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const item = await userProgressService.getOne(req.user.id, req.params.trainingId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function updateProgress(req, res, next) {
  try {
    const item = await userProgressService.upsertProgress(
      req.user.id,
      req.params.trainingId,
      req.body
    );
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getByUser,
  getOne,
  updateProgress,
};
