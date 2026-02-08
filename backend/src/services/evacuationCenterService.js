const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function list() {
  return prisma.evacuationCenter.findMany({
    orderBy: [{ province: 'asc' }, { city: 'asc' }, { name: 'asc' }],
  });
}

async function getNear(lat, lng, radiusKm = 50) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  const radiusNum = Math.min(Math.max(Number(radiusKm) || 50, 0.1), 500);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    throw new AppError('Valid lat and lng query parameters are required', 400);
  }

  const centers = await prisma.evacuationCenter.findMany();
  const withDistance = centers.map((c) => ({
    ...c,
    distanceKm: haversineKm(latNum, lngNum, c.lat, c.lng),
  }));
  const inRadius = withDistance.filter((c) => c.distanceKm <= radiusNum);
  inRadius.sort((a, b) => a.distanceKm - b.distanceKm);
  return inRadius;
}

async function getById(id) {
  const item = await prisma.evacuationCenter.findUnique({ where: { id } });
  if (!item) throw new AppError('Evacuation center not found', 404);
  return item;
}

async function create(data) {
  return prisma.evacuationCenter.create({
    data: {
      name: data.name,
      barangay: data.barangay,
      city: data.city,
      province: data.province,
      capacity: data.capacity,
      lat: data.lat,
      lng: data.lng,
    },
  });
}

async function update(id, data) {
  await getById(id);
  return prisma.evacuationCenter.update({
    where: { id },
    data: {
      name: data.name,
      barangay: data.barangay,
      city: data.city,
      province: data.province,
      capacity: data.capacity,
      lat: data.lat,
      lng: data.lng,
    },
  });
}

async function remove(id) {
  await getById(id);
  await prisma.evacuationCenter.delete({ where: { id } });
  return { message: 'Evacuation center deleted' };
}

module.exports = {
  list,
  getNear,
  getById,
  create,
  update,
  remove,
  haversineKm,
};
