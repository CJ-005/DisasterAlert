const questionService = require('../services/questionService');

async function listByAssessment(req, res, next) {
  try {
    const items = await questionService.listByAssessment(req.params.assessmentId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await questionService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await questionService.create({
      ...req.body,
      assessmentId: req.params.assessmentId,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await questionService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await questionService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listByAssessment,
  getById,
  create,
  update,
  remove,
};
