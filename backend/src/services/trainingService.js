const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function list(filters = {}) {
  const { disasterType, difficulty, agencyId } = filters;
  const where = {};
  if (disasterType) where.disasterType = disasterType;
  if (difficulty) where.difficulty = difficulty;
  if (agencyId) where.agencyId = agencyId;

  return prisma.training.findMany({
    where,
    include: { agency: true, _count: { select: { lessons: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getById(id) {
  const training = await prisma.training.findUnique({
    where: { id },
    include: {
      agency: true,
      lessons: { orderBy: { order: 'asc' } },
      assessment: { include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } } },
    },
  });
  if (!training) throw new AppError('Training not found', 404);
  return training;
}

async function getByIdForUser(id) {
  const training = await prisma.training.findUnique({
    where: { id },
    include: {
      agency: true,
      lessons: { orderBy: { order: 'asc' } },
      assessment: {
        include: {
          questions: {
            include: { choices: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
  if (!training) throw new AppError('Training not found', 404);
  // Strip isCorrect from choices so client cannot cheat on assessment
  if (training.assessment?.questions) {
    training.assessment.questions = training.assessment.questions.map((q) => ({
      ...q,
      choices: q.choices.map(({ id, text, order }) => ({ id, text, order })),
    }));
  }
  return training;
}

async function create(data) {
  return prisma.training.create({
    data: {
      title: data.title,
      description: data.description,
      disasterType: data.disasterType,
      difficulty: data.difficulty,
      agencyId: data.agencyId || undefined,
    },
    include: { agency: true },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.training.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      disasterType: data.disasterType,
      difficulty: data.difficulty,
      agencyId: data.agencyId ?? undefined,
    },
    include: { agency: true },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.training.delete({ where: { id } });
  return { message: 'Training deleted' };
}

module.exports = {
  list,
  getById,
  getByIdForUser,
  create,
  update,
  remove,
};
