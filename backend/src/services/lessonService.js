const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function listByTraining(trainingId) {
  return prisma.lesson.findMany({
    where: { trainingId },
    orderBy: { order: 'asc' },
  });
}

async function getById(id) {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { training: true },
  });
  if (!lesson) throw new AppError('Lesson not found', 404);
  return lesson;
}

async function create(data) {
  const training = await prisma.training.findUnique({ where: { id: data.trainingId } });
  if (!training) throw new AppError('Training not found', 404);
  return prisma.lesson.create({
    data: {
      trainingId: data.trainingId,
      order: data.order ?? 0,
      title: data.title,
      content: data.content,
    },
    include: { training: true },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.lesson.update({
    where: { id },
    data: {
      order: data.order,
      title: data.title,
      content: data.content,
    },
    include: { training: true },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.lesson.delete({ where: { id } });
  return { message: 'Lesson deleted' };
}

module.exports = {
  listByTraining,
  getById,
  create,
  update,
  remove,
};
