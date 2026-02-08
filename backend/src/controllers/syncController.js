const syncService = require('../services/syncService');

async function queue(req, res, next) {
  try {
    const { kind, payload } = req.body;
    const item = await syncService.queue(req.user.id, kind, payload);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function flush(req, res, next) {
  try {
    const result = await syncService.flush(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  queue,
  flush,
};
