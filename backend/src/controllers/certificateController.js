const certificateService = require('../services/certificateService');

async function listMy(req, res, next) {
  try {
    const items = await certificateService.listByUser(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const item = await certificateService.getOne(req.user.id, req.params.trainingId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function issue(req, res, next) {
  try {
    const { certificateUrl } = req.body;
    const item = await certificateService.issue(
      req.user.id,
      req.params.trainingId,
      certificateUrl
    );
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMy,
  getOne,
  issue,
};
