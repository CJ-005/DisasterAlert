const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');

const XP_PER_LEVEL = 100;
const XP_TRAINING_COMPLETED = 50;
const XP_ASSESSMENT_PASSED = 75;

function xpToLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

async function getOrCreateUserXP(userId) {
  let userXP = await prisma.userXP.findUnique({
    where: { userId },
  });
  if (!userXP) {
    userXP = await prisma.userXP.create({
      data: { userId },
    });
  }
  return userXP;
}

async function getMe(userId) {
  const userXP = await getOrCreateUserXP(userId);
  const badges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  });
  const allBadges = await prisma.badge.findMany({ orderBy: { xpRequired: 'asc' } });
  return {
    xp: userXP.xp,
    level: xpToLevel(userXP.xp),
    streakDays: userXP.streakDays,
    lastActive: userXP.lastActive,
    badges: badges.map((ub) => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    })),
    allBadges: allBadges.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      xpRequired: b.xpRequired,
      iconUrl: b.iconUrl,
      earned: badges.some((ub) => ub.badgeId === b.id),
    })),
  };
}

function startOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

async function updateStreak(userXP) {
  const now = new Date();
  const today = startOfDay(now);
  const last = userXP.lastActive ? new Date(userXP.lastActive) : null;
  const lastDay = last ? startOfDay(last) : null;
  let streakDays = userXP.streakDays || 0;
  if (lastDay === null) {
    streakDays = 1;
  } else if (today - lastDay === 86400000) {
    streakDays += 1;
  } else if (today > lastDay) {
    streakDays = 1;
  }
  return prisma.userXP.update({
    where: { id: userXP.id },
    data: { lastActive: now, streakDays },
  });
}

async function addXP(userId, amount, reason) {
  const userXP = await getOrCreateUserXP(userId);
  const updated = await prisma.userXP.update({
    where: { id: userXP.id },
    data: {
      xp: userXP.xp + amount,
      level: xpToLevel(userXP.xp + amount),
      lastActive: new Date(),
    },
  });
  await updateStreak(updated);
  await awardBadgesIfEligible(userId, updated.xp);
  return updated;
}

async function awardBadgesIfEligible(userId, totalXp) {
  const badges = await prisma.badge.findMany({
    where: { xpRequired: { lte: totalXp } },
  });
  for (const badge of badges) {
    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: { userId, badgeId: badge.id },
      },
      create: { userId, badgeId: badge.id },
      update: {},
    });
  }
}

async function onTrainingCompleted(userId) {
  return addXP(userId, XP_TRAINING_COMPLETED, 'training_completed');
}

async function onAssessmentPassed(userId) {
  return addXP(userId, XP_ASSESSMENT_PASSED, 'assessment_passed');
}

module.exports = {
  getMe,
  getOrCreateUserXP,
  onTrainingCompleted,
  onAssessmentPassed,
  addXP,
};
