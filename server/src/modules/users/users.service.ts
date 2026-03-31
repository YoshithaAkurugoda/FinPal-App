import { prisma } from '../../lib/prisma.js';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    monthlyIncome: user.monthlyIncome ? Number(user.monthlyIncome) : null,
    currency: user.currency,
    fcmToken: user.fcmToken,
    notificationPrefs: user.notificationPrefs,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    monthlyIncome?: number;
    currency?: string;
    notificationPrefs?: Record<string, unknown>;
  },
) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.monthlyIncome !== undefined) updateData.monthlyIncome = data.monthlyIncome;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.notificationPrefs !== undefined) updateData.notificationPrefs = data.notificationPrefs as any;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    monthlyIncome: user.monthlyIncome ? Number(user.monthlyIncome) : null,
    currency: user.currency,
    fcmToken: user.fcmToken,
    notificationPrefs: user.notificationPrefs,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateFcmToken(userId: string, token: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { fcmToken: token },
  });
}
