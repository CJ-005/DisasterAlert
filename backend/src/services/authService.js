const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');
const { toSafeUser } = require('../utils/safeUser');
const { AppError } = require('../utils/AppError');

const SALT_ROUNDS = 12;

async function register({ name, email, password, role = 'USER', agencyId }) {
  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role.toUpperCase(),
      agencyId: agencyId || undefined,
    },
    include: { agency: true },
  });
  const token = signToken(user.id);
  return { token, user: toSafeUser(user) };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { agency: true },
  });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = signToken(user.id);
  return { token, user: toSafeUser(user) };
}

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = {
  register,
  login,
};
