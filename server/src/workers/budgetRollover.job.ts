import { prisma } from '../lib/prisma.js';
import { redis } from '../config/redis.js';
import { getBudgetSpend, invalidateBudgetCache } from '../services/budget.service.js';

export async function processBudgetRolloverJob(): Promise<void> {
  const budgets = await prisma.budget.findMany({
    where: { rollover: true },
    select: {
      id: true,
      userId: true,
      category: true,
      amountLimit: true,
      period: true,
    },
  });

  const now = new Date();

  for (const budget of budgets) {
    const period = budget.period as 'monthly' | 'weekly';

    // Compute how much was unspent in the PREVIOUS period
    const prevSpend = await getPrevPeriodSpend(budget.userId, budget.category, period);
    const limit = Number(budget.amountLimit);
    const unspent = Math.max(0, limit - prevSpend);

    if (unspent > 0) {
      // Carry unspent forward by increasing the limit for this period
      const newLimit = limit + unspent;
      await prisma.budget.update({
        where: { id: budget.id },
        data: {
          amountLimit: newLimit,
          lastResetDate: now,
        },
      });
    } else {
      await prisma.budget.update({
        where: { id: budget.id },
        data: { lastResetDate: now },
      });
    }

    await invalidateBudgetCache(budget.userId, budget.category);
  }

  console.log(`[BudgetRollover] Processed ${budgets.length} rollover budgets`);
}

async function getPrevPeriodSpend(
  userId: string,
  category: string,
  period: 'monthly' | 'weekly',
): Promise<number> {
  const now = new Date();
  let prevStart: Date;
  let prevEnd: Date;

  if (period === 'monthly') {
    // Previous month
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else {
    // Previous week (Mon-Sun)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const thisMonday = new Date(now.getFullYear(), now.getMonth(), diff);
    prevStart = new Date(thisMonday);
    prevStart.setDate(thisMonday.getDate() - 7);
    prevEnd = new Date(thisMonday);
    prevEnd.setMilliseconds(-1);
  }

  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      category,
      status: 'approved',
      type: 'debit',
      transactionDate: { gte: prevStart, lte: prevEnd },
    },
    _sum: { amount: true },
  });

  return Number(aggregate._sum.amount ?? 0);
}
