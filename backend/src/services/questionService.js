const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function listByAssessment(assessmentId) {
  return prisma.question.findMany({
    where: { assessmentId },
    include: { choices: true },
    orderBy: { order: 'asc' },
  });
}

async function getById(id) {
  const q = await prisma.question.findUnique({
    where: { id },
    include: { assessment: true, choices: true },
  });
  if (!q) throw new AppError('Question not found', 404);
  return q;
}

async function create(data) {
  const assessment = await prisma.assessment.findUnique({ where: { id: data.assessmentId } });
  if (!assessment) throw new AppError('Assessment not found', 404);
  return prisma.question.create({
    data: {
      assessmentId: data.assessmentId,
      order: data.order ?? 0,
      text: data.text,
    },
    include: { assessment: true },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.question.update({
    where: { id },
    data: { order: data.order, text: data.text },
    include: { assessment: true, choices: true },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.question.delete({ where: { id } });
  return { message: 'Question deleted' };
}

module.exports = {
  listByAssessment,
  getById,
  create,
  update,
  remove,
};
