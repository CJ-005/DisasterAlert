const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function list() {
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function getById(id) {
  const item = await prisma.announcement.findUnique({ where: { id } });
  if (!item) throw new AppError('Announcement not found', 404);
  return item;
}

async function create(data) {
  return prisma.announcement.create({
    data: { title: data.title, content: data.content },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.announcement.update({
    where: { id },
    data: { title: data.title, content: data.content },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.announcement.delete({ where: { id } });
  return { message: 'Announcement deleted' };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
