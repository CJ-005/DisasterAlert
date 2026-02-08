const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

async function list(filters = {}) {
  const { type, severity } = filters;
  const where = {};
  if (type) where.type = type;
  if (severity) where.severity = severity;
  return prisma.disasterAlert.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });
}

async function getById(id) {
  const item = await prisma.disasterAlert.findUnique({ where: { id } });
  if (!item) throw new AppError('Disaster alert not found', 404);
  return item;
}

async function create(data) {
  return prisma.disasterAlert.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      severity: data.severity,
      source: data.source,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.disasterAlert.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      severity: data.severity,
      source: data.source,
      publishedAt: data.publishedAt != null ? new Date(data.publishedAt) : undefined,
    },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.disasterAlert.delete({ where: { id } });
  return { message: 'Disaster alert deleted' };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
