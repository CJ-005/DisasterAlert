const contactMessageService = require('../services/contactMessageService');
const { AppError } = require('../utils/AppError');

async function list(req, res, next) {
  try {
    const items = await contactMessageService.list();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await contactMessageService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return next(new AppError('Name, email and message are required', 400));
    }
    const item = await contactMessageService.create({
      name,
      email,
      message,
      userId: req.user?.id,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const item = await contactMessageService.markRead(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  markRead,
};
