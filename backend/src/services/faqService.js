const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function list() {
  return prisma.fAQ.findMany({
    orderBy: { order: 'asc' },
  });
}

async function getById(id) {
  const item = await prisma.fAQ.findUnique({ where: { id } });
  if (!item) throw new AppError('FAQ not found', 404);
  return item;
}

async function create(data) {
  return prisma.fAQ.create({
    data: {
      question: data.question,
      answer: data.answer,
      order: data.order ?? 0,
    },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.fAQ.update({
    where: { id },
    data: { question: data.question, answer: data.answer, order: data.order },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.fAQ.delete({ where: { id } });
  return { message: 'FAQ deleted' };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
