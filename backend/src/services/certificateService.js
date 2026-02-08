const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function listByUser(userId) {
  return prisma.certificate.findMany({
    where: { userId },
    include: { training: true },
    orderBy: { issuedAt: 'desc' },
  });
}

async function getOne(userId, trainingId) {
  const cert = await prisma.certificate.findUnique({
    where: { userId_trainingId: { userId, trainingId } },
    include: { training: true },
  });
  if (!cert) throw new AppError('Certificate not found', 404);
  return cert;
}

async function issue(userId, trainingId, certificateUrl) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId_trainingId: { userId, trainingId } },
  });
  if (!progress) throw new AppError('Training progress not found', 404);
  if (progress.status !== 'COMPLETED') {
    throw new AppError('Training must be completed before issuing certificate', 400);
  }

  const assessment = await prisma.assessment.findUnique({
    where: { trainingId },
    include: { results: { where: { userId }, orderBy: { takenAt: 'desc' }, take: 1 } },
  });
  if (!assessment) throw new AppError('No assessment for this training', 404);
  const latestResult = assessment.results[0];
  if (!latestResult) throw new AppError('Assessment must be passed before issuing certificate', 400);
  if (!latestResult.passed) {
    throw new AppError('Assessment must be passed before issuing certificate', 400);
  }

  const existing = await prisma.certificate.findUnique({
    where: { userId_trainingId: { userId, trainingId } },
  });
  if (existing) throw new AppError('Certificate already issued for this training', 409);

  const cert = await prisma.certificate.create({
    data: {
      userId,
      trainingId,
      certificateUrl: certificateUrl || `https://example.com/certs/${userId}-${trainingId}.pdf`,
    },
    include: { training: true },
  });
  return cert;
}

module.exports = {
  listByUser,
  getOne,
  issue,
};
