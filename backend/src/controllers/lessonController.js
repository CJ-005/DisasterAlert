const lessonService = require('../services/lessonService');

async function listByTraining(req, res, next) {
  try {
    const items = await lessonService.listByTraining(req.params.trainingId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await lessonService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await lessonService.create({ ...req.body, trainingId: req.params.trainingId });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await lessonService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await lessonService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listByTraining,
  getById,
  create,
  update,
  remove,
};
