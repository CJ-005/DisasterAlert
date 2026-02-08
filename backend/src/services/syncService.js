const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');
const userProgressService = require('./userProgressService');
const assessmentService = require('./assessmentService');

const VALID_KINDS = ['PROGRESS', 'RESULT'];

function validateProgressPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new AppError('Invalid progress payload', 400);
  const trainingId = payload.trainingId;
  const completedLessons = payload.completedLessons;
  if (!trainingId || typeof trainingId !== 'string') throw new AppError('progress.trainingId is required', 400);
  if (completedLessons === undefined || completedLessons === null) throw new AppError('progress.completedLessons is required', 400);
  return { trainingId, completedLessons: Number(completedLessons) };
}

function validateResultPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new AppError('Invalid result payload', 400);
  const assessmentId = payload.assessmentId;
  const answers = payload.answers;
  if (!assessmentId || typeof assessmentId !== 'string') throw new AppError('result.assessmentId is required', 400);
  if (!Array.isArray(answers)) throw new AppError('result.answers must be an array', 400);
  return { assessmentId, answers };
}

async function queue(userId, kind, payload) {
  if (!VALID_KINDS.includes(kind)) throw new AppError('Invalid kind: use PROGRESS or RESULT', 400);
  if (kind === 'PROGRESS') validateProgressPayload(payload);
  if (kind === 'RESULT') validateResultPayload(payload);

  const item = await prisma.offlineSyncQueue.create({
    data: { userId, kind, payload },
  });
  return item;
}

async function flush(userId) {
  const pending = await prisma.offlineSyncQueue.findMany({
    where: { userId, status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });

  const results = { processed: 0, failed: 0, errors: [] };

  for (const item of pending) {
    try {
      if (item.kind === 'PROGRESS') {
        const { trainingId, completedLessons } = validateProgressPayload(item.payload);
        await userProgressService.upsertProgress(userId, trainingId, { completedLessons });
      } else if (item.kind === 'RESULT') {
        const { assessmentId, answers } = validateResultPayload(item.payload);
        await assessmentService.submitAssessment(userId, assessmentId, answers);
      }
      await prisma.offlineSyncQueue.update({
        where: { id: item.id },
        data: { status: 'PROCESSED', processedAt: new Date(), error: null },
      });
      results.processed += 1;
    } catch (err) {
      await prisma.offlineSyncQueue.update({
        where: { id: item.id },
        data: { status: 'FAILED', error: err.message || 'Unknown error' },
      });
      results.failed += 1;
      results.errors.push({ id: item.id, message: err.message });
    }
  }

  return results;
}

module.exports = {
  queue,
  flush,
};
