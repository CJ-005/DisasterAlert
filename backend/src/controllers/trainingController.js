const trainingService = require('../services/trainingService');

async function list(req, res, next) {
  try {
    const { disasterType, difficulty, agencyId } = req.query;
    const items = await trainingService.list({ disasterType, difficulty, agencyId });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await trainingService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function getByIdForUser(req, res, next) {
  try {
    const item = await trainingService.getByIdForUser(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await trainingService.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await trainingService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await trainingService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  getByIdForUser,
  create,
  update,
  remove,
};
