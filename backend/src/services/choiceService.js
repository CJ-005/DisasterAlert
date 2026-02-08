const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function getById(id) {
  const c = await prisma.choice.findUnique({
    where: { id },
    include: { question: true },
  });
  if (!c) throw new AppError('Choice not found', 404);
  return c;
}

async function create(data) {
  const question = await prisma.question.findUnique({ where: { id: data.questionId } });
  if (!question) throw new AppError('Question not found', 404);
  return prisma.choice.create({
    data: {
      questionId: data.questionId,
      text: data.text,
      isCorrect: data.isCorrect ?? false,
      order: data.order ?? 0,
    },
    include: { question: true },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.choice.update({
    where: { id },
    data: { text: data.text, isCorrect: data.isCorrect, order: data.order },
    include: { question: true },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.choice.delete({ where: { id } });
  return { message: 'Choice deleted' };
}

module.exports = {
  getById,
  create,
  update,
  remove,
};
