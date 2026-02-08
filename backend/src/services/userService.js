const bcrypt = require('bcrypt');
const { prisma } = require('../lib/prisma');
const { toSafeUser } = require('../utils/safeUser');
const { AppError } = require('../utils/AppError');

const SALT_ROUNDS = 12;

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { agency: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return toSafeUser(user);
}

async function updateMe(userId, { name }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: name !== undefined ? { name: name.trim() } : {},
    include: { agency: true },
  });
  return toSafeUser(user);
}

async function updatePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Current password is incorrect', 400);
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  return { message: 'Password updated successfully' };
}

async function deactivate(userId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    include: { agency: true },
  });
  return toSafeUser(user);
}

module.exports = {
  getMe,
  updateMe,
  updatePassword,
  deactivate,
};
