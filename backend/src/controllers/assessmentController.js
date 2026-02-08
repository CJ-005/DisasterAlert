const assessmentService = require('../services/assessmentService');
const { AppError } = require('../utils/AppError');

async function getByTrainingId(req, res, next) {
  try {
    const item = await assessmentService.getByTrainingId(req.params.trainingId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await assessmentService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await assessmentService.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await assessmentService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await assessmentService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function submit(req, res, next) {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return next(new AppError('answers array is required', 400));
    }
    const item = await assessmentService.submitAssessment(
      req.user.id,
      req.params.assessmentId,
      answers
    );
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getByTrainingId,
  getById,
  create,
  update,
  remove,
  submit,
};
