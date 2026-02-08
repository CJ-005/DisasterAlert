const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function getByUser(userId) {
  return prisma.userProgress.findMany({
    where: { userId },
    include: { training: true },
    orderBy: { updatedAt: 'desc' },
  });
}

async function getOne(userId, trainingId) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId_trainingId: { userId, trainingId } },
    include: { training: true },
  });
  if (!progress) throw new AppError('Progress not found', 404);
  return progress;
}

async function upsertProgress(userId, trainingId, { completedLessons }) {
  const training = await prisma.training.findUnique({
    where: { id: trainingId },
    include: { _count: { select: { lessons: true } } },
  });
  if (!training) throw new AppError('Training not found', 404);

  const totalLessons = training._count.lessons;
  const completed = Math.min(Math.max(0, Number(completedLessons) || 0), totalLessons);
  const progressPercent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 100;
  const status = progressPercent >= 100 ? 'COMPLETED' : 'IN_PROGRESS';

  const previous = await prisma.userProgress.findUnique({
    where: { userId_trainingId: { userId, trainingId } },
  });
  const progress = await prisma.userProgress.upsert({
    where: { userId_trainingId: { userId, trainingId } },
    create: {
      userId,
      trainingId,
      progressPercent,
      completedLessons: completed,
      status,
    },
    update: {
      progressPercent,
      completedLessons: completed,
      status,
    },
    include: { training: true },
  });
  if (status === 'COMPLETED' && (!previous || previous.status !== 'COMPLETED')) {
    const gamificationService = require('./gamificationService');
    gamificationService.onTrainingCompleted(userId).catch(() => {});
  }
  return progress;
}

module.exports = {
  getByUser,
  getOne,
  upsertProgress,
};
