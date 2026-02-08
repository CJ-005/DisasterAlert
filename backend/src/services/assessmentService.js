const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function getByTrainingId(trainingId) {
  const assessment = await prisma.assessment.findUnique({
    where: { trainingId },
    include: {
      questions: {
        include: { choices: true },
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!assessment) throw new AppError('Assessment not found', 404);
  return assessment;
}

async function getById(id) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      training: true,
      questions: { include: { choices: true }, orderBy: { order: 'asc' } },
    },
  });
  if (!assessment) throw new AppError('Assessment not found', 404);
  return assessment;
}

async function create(data) {
  const training = await prisma.training.findUnique({ where: { id: data.trainingId } });
  if (!training) throw new AppError('Training not found', 404);
  const existing = await prisma.assessment.findUnique({ where: { trainingId: data.trainingId } });
  if (existing) throw new AppError('Assessment already exists for this training', 409);
  return prisma.assessment.create({
    data: {
      trainingId: data.trainingId,
      title: data.title,
      passingScore: data.passingScore ?? 70,
    },
    include: { training: true },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.assessment.update({
    where: { id },
    data: { title: data.title, passingScore: data.passingScore },
    include: { training: true },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.assessment.delete({ where: { id } });
  return { message: 'Assessment deleted' };
}

async function submitAssessment(userId, assessmentId, answers) {
  // answers: [{ questionId, choiceId }, ...]
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: { include: { choices: true } },
      training: true,
    },
  });
  if (!assessment) throw new AppError('Assessment not found', 404);

  const choiceIdToCorrect = new Map();
  for (const q of assessment.questions) {
    for (const c of q.choices) {
      choiceIdToCorrect.set(c.id, c.isCorrect);
    }
  }

  let correct = 0;
  const total = assessment.questions.length;
  if (total === 0) throw new AppError('Assessment has no questions', 400);

  for (const a of answers) {
    if (choiceIdToCorrect.get(a.choiceId) === true) correct++;
  }
  const score = Math.round((correct / total) * 100);
  const passed = score >= assessment.passingScore;

  const result = await prisma.result.create({
    data: {
      userId,
      assessmentId,
      score,
      passed,
    },
    include: { assessment: true },
  });
  if (passed) {
    const gamificationService = require('./gamificationService');
    gamificationService.onAssessmentPassed(userId).catch(() => {});
  }
  return result;
}

module.exports = {
  getByTrainingId,
  getById,
  create,
  update,
  remove,
  submitAssessment,
};
