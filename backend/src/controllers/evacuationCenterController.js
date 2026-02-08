const evacuationCenterService = require('../services/evacuationCenterService');

async function list(req, res, next) {
  try {
    const items = await evacuationCenterService.list();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getNear(req, res, next) {
  try {
    const { lat, lng, radius } = req.query;
    const items = await evacuationCenterService.getNear(lat, lng, radius);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await evacuationCenterService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await evacuationCenterService.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await evacuationCenterService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await evacuationCenterService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getNear,
  getById,
  create,
  update,
  remove,
};
