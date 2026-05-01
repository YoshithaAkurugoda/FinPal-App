import { prisma } from '../lib/prisma.js';
import { sendNotification } from '../services/notification.service.js';

export async function processReconciliationReminderJob(): Promise<void> {
  const batchSize = 20;
  let cursor: string | undefined;

  while (true) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true },
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) break;

    await Promise.allSettled(
      users.map((u) =>
        sendNotification(
          u.id,
          'Monthly reconciliation',
          `Hi ${u.name}! Time to verify your wallet balances and keep your records accurate.`,
          { type: 'reconciliation_reminder', screen: '/reconcile' },
        ),
      ),
    );

    if (users.length < batchSize) break;
    cursor = users[users.length - 1].id;
  }

  console.log('[ReconciliationReminder] Notifications sent');
}
