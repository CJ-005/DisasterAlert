const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function listByUser(userId) {
  return prisma.result.findMany({
    where: { userId },
    include: { assessment: { include: { training: true } } },
    orderBy: { takenAt: 'desc' },
  });
}

async function listByAssessment(assessmentId) {
  return prisma.result.findMany({
    where: { assessmentId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { takenAt: 'desc' },
  });
}

async function getById(id, userId, role) {
  const result = await prisma.result.findUnique({
    where: { id },
    include: {
      assessment: { include: { training: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!result) throw new AppError('Result not found', 404);
  if (role !== 'ADMIN' && result.userId !== userId) {
    throw new AppError('Forbidden', 403);
  }
  return result;
}

module.exports = {
  listByUser,
  listByAssessment,
  getById,
};
