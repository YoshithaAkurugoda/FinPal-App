import { prisma } from '../lib/prisma.js';
import { notificationQueue } from '../config/queue.js';

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) return;

  await notificationQueue.add('notification_dispatch', {
    userId,
    fcmToken: user.fcmToken,
    title,
    body,
    data,
  });

  console.log(`[Notification] Enqueued for user ${userId}: ${title}`);
}
