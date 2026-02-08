const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function list() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

async function getById(id) {
  const item = await prisma.contactMessage.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!item) throw new AppError('Contact message not found', 404);
  return item;
}

async function create(data) {
  return prisma.contactMessage.create({
    data: {
      userId: data.userId,
      name: data.name,
      email: data.email,
      message: data.message,
    },
  });
}

async function markRead(id) {
  await getById(id);
  return prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
}

module.exports = {
  list,
  getById,
  create,
  markRead,
};
