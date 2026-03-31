import { BUDGET_CACHE_TTL } from '@finpal/shared';

import { prisma } from '../lib/prisma.js';
import { redis } from '../config/redis.js';
import { sendNotification } from './notification.service.js';

function getPeriodStart(period: 'monthly' | 'weekly'): Date {
  const now = new Date();
  if (period === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.getFullYear(), now.getMonth(), diff);
}

function cacheKey(userId: string, category: string, period: string): string {
  return `budget:${userId}:${category}:${period}`;
}

export async function getBudgetSpend(
  userId: string,
  category: string,
  period: 'monthly' | 'weekly',
): Promise<number> {
  const key = cacheKey(userId, category, period);

  try {
    const cached = await redis.get(key);
    if (cached !== null) return parseFloat(cached);
  } catch {
    // Redis unavailable — fall through to DB
  }

  const periodStart = getPeriodStart(period);

  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      category,
      status: 'approved',
      type: 'debit',
      transactionDate: { gte: periodStart },
    },
    _sum: { amount: true },
  });

  const spend = Number(aggregate._sum.amount ?? 0);

  try {
    await redis.set(key, spend.toString(), 'EX', BUDGET_CACHE_TTL);
  } catch {
    // Redis unavailable — continue without caching
  }

  return spend;
}

export async function invalidateBudgetCache(
  userId: string,
  category: string,
): Promise<void> {
  try {
    await redis.del(cacheKey(userId, category, 'monthly'));
    await redis.del(cacheKey(userId, category, 'weekly'));
  } catch {
    // Redis unavailable
  }
}

export async function checkBudgetThresholds(
  userId: string,
  category: string,
): Promise<void> {
  const budgets = await prisma.budget.findMany({
    where: { userId, category },
  });

  for (const budget of budgets) {
    const period = budget.period as 'monthly' | 'weekly';
    const spend = await getBudgetSpend(userId, category, period);
    const limit = Number(budget.amountLimit);
    const percentage = (spend / limit) * 100;

    for (const threshold of [80, 90] as const) {
      if (percentage < threshold) continue;

      const flagKey = `budget_alert:${userId}:${category}:${period}:${threshold}`;

      try {
        const alreadySent = await redis.get(flagKey);
        if (alreadySent) continue;
        await redis.set(flagKey, '1', 'EX', getPeriodTtl(period));
      } catch {
        // Redis unavailable — still try to notify once
      }

      await sendNotification(
        userId,
        `Budget: ${category}`,
        `You've used ${Math.round(percentage)}% of your ${period} ${category} budget.`,
        { type: 'budget_warning', category, threshold: String(threshold) },
      );
    }
  }
}

function getPeriodTtl(period: 'monthly' | 'weekly'): number {
  return period === 'monthly' ? 30 * 24 * 3600 : 7 * 24 * 3600;
}
