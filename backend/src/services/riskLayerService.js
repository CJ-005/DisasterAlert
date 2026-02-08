const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

const VALID_TYPES = ['FLOOD', 'LANDSLIDE', 'EVAC_ROUTE'];

async function listByType(type) {
  if (type && !VALID_TYPES.includes(type)) {
    throw new AppError('Invalid risk layer type', 400);
  }
  const where = type ? { type } : {};
  return prisma.riskLayer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

async function getById(id) {
  const item = await prisma.riskLayer.findUnique({ where: { id } });
  if (!item) throw new AppError('Risk layer not found', 404);
  return item;
}

async function create(data) {
  if (!VALID_TYPES.includes(data.type)) {
    throw new AppError('Invalid risk layer type', 400);
  }
  return prisma.riskLayer.create({
    data: {
      type: data.type,
      name: data.name,
      geojson: data.geojson,
    },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.riskLayer.update({
    where: { id },
    data: {
      type: data.type,
      name: data.name,
      geojson: data.geojson,
    },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.riskLayer.delete({ where: { id } });
  return { message: 'Risk layer deleted' };
}

module.exports = {
  listByType,
  getById,
  create,
  update,
  remove,
};
