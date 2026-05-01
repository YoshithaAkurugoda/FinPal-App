import type { Budget } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';
import { getBudgetSpend } from '../../services/budget.service.js';

async function toBudgetDto(userId: string, b: Budget) {
  const period = b.period as 'monthly' | 'weekly';
  const spent = await getBudgetSpend(userId, b.category, period);
  const limit = Number(b.amountLimit);
  const remaining = Math.max(0, limit - spent);
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  return {
    ...b,
    amountLimit: limit,
    spent,
    remaining,
    percentage,
  };
}

export async function createBudget(
  userId: string,
  data: { category: string; amountLimit: number; period: string; rollover?: boolean },
) {
  const created = await prisma.budget.create({
    data: {
      userId,
      category: data.category,
      amountLimit: data.amountLimit,
      period: data.period,
      rollover: data.rollover ?? false,
    },
  });
  return toBudgetDto(userId, created);
}

export async function getBudgets(userId: string) {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return Promise.all(budgets.map((b) => toBudgetDto(userId, b)));
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  data: { amountLimit?: number; period?: string; rollover?: boolean },
) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!budget) {
    throw Object.assign(new Error('Budget not found'), { statusCode: 404 });
  }

  const updated = await prisma.budget.update({
    where: { id: budgetId },
    data: {
      ...(data.amountLimit !== undefined && { amountLimit: data.amountLimit }),
      ...(data.period !== undefined && { period: data.period }),
      ...(data.rollover !== undefined && { rollover: data.rollover }),
    },
  });
  return toBudgetDto(userId, updated);
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!budget) {
    throw Object.assign(new Error('Budget not found'), { statusCode: 404 });
  }

  await prisma.budget.delete({ where: { id: budgetId } });
}
