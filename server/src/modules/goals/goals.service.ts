import { GOAL_MILESTONES } from '@finpal/shared';

import { prisma } from '../../lib/prisma.js';
import { sendNotification } from '../../services/notification.service.js';
import { checkBudgetThresholds, invalidateBudgetCache } from '../../services/budget.service.js';
import { computeNetBalance } from '../../services/ledger.service.js';

function mapGoalRow(g: {
  id: string;
  userId: string;
  name: string;
  targetAmount: unknown;
  currentAmount: unknown;
  targetDate: Date | null;
  status: string;
  createdAt: Date;
}) {
  const target = Number(g.targetAmount);
  const current = Number(g.currentAmount);
  const remaining = Math.max(0, target - current);
  let weeklyTarget = 0;
  let projectedDate: Date | null = null;
  if (g.targetDate && remaining > 0) {
    const now = new Date();
    const targetDate = new Date(g.targetDate);
    const weeksLeft = Math.max(1, (targetDate.getTime() - now.getTime()) / (7 * 24 * 3600 * 1000));
    weeklyTarget = remaining / weeksLeft;
    projectedDate = targetDate;
  } else if (g.targetDate) {
    projectedDate = new Date(g.targetDate);
  }
  return {
    ...g,
    targetAmount: target,
    currentAmount: current,
    progress: target > 0 ? current / target : 0,
    projectedDate,
    weeklyTarget: Math.round(weeklyTarget * 100) / 100,
  };
}

export async function createGoal(
  userId: string,
  data: { name: string; targetAmount: number; targetDate?: string },
) {
  const created = await prisma.goal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
    },
  });
  return mapGoalRow(created);
}

export async function getGoals(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return goals.map((g) => {
    const target = Number(g.targetAmount);
    const current = Number(g.currentAmount);
    const remaining = Math.max(0, target - current);
    const progress = target > 0 ? current / target : 0;

    let projectedDate: Date | null = null;
    let weeklyTarget = 0;

    if (g.targetDate && remaining > 0) {
      const now = new Date();
      const targetDate = new Date(g.targetDate);
      const weeksLeft = Math.max(1, (targetDate.getTime() - now.getTime()) / (7 * 24 * 3600 * 1000));
      weeklyTarget = remaining / weeksLeft;
    }

    if (g.targetDate) {
      projectedDate = new Date(g.targetDate);
    }

    return {
      ...g,
      targetAmount: target,
      currentAmount: current,
      progress,
      projectedDate,
      weeklyTarget: Math.round(weeklyTarget * 100) / 100,
    };
  });
}

export async function contributeToGoal(
  userId: string,
  goalId: string,
  data: { amount: number; walletId: string },
) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId, status: 'active' },
  });

  if (!goal) {
    throw Object.assign(new Error('Goal not found or not active'), { statusCode: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        walletId: data.walletId,
        amount: data.amount,
        signedAmount: -Math.abs(data.amount),
        type: 'debit',
        category: 'Savings',
        status: 'approved',
        source: 'goal_contribution',
        transactionDate: new Date(),
        metadata: { goalId, goalName: goal.name },
      },
    });

    const updatedGoal = await tx.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: { increment: data.amount },
      },
    });

    const newAmount = Number(updatedGoal.currentAmount);
    const target = Number(updatedGoal.targetAmount);

    if (newAmount >= target) {
      await tx.goal.update({
        where: { id: goalId },
        data: { status: 'completed' },
      });
      updatedGoal.status = 'completed';
    }

    return { goal: updatedGoal, transaction };
  });

  await invalidateBudgetCache(userId, 'Savings');
  await checkBudgetThresholds(userId, 'Savings');

  const percentage = (Number(result.goal.currentAmount) / Number(result.goal.targetAmount)) * 100;
  for (const milestone of GOAL_MILESTONES) {
    const prevAmount = Number(goal.currentAmount);
    const prevPercentage = (prevAmount / Number(goal.targetAmount)) * 100;
    if (percentage >= milestone && prevPercentage < milestone) {
      await sendNotification(
        userId,
        `Goal Milestone: ${goal.name}`,
        `You've reached ${milestone}% of your "${goal.name}" goal!`,
        { type: 'goal_milestone', goalId },
      );
      break;
    }
  }

  // Refresh projected completion in the background
  void refreshProjectedCompletion(userId, goalId);

  return { goal: mapGoalRow(result.goal), transaction: result.transaction };
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: { name?: string; targetAmount?: number; targetDate?: string | null },
) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw Object.assign(new Error('Goal not found'), { statusCode: 404 });

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
      ...(data.targetDate !== undefined && {
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      }),
    },
  });

  // Recompute projected completion after edit
  await refreshProjectedCompletion(userId, goalId);

  return mapGoalRow(updated);
}

export async function archiveGoal(userId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw Object.assign(new Error('Goal not found'), { statusCode: 404 });

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: { status: 'archived' },
  });
  return mapGoalRow(updated);
}

/**
 * Compute projected completion date from last-30-day average monthly surplus,
 * then persist it to Goal.projectedCompletionDate.
 */
export async function refreshProjectedCompletion(userId: string, goalId: string): Promise<void> {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) return;

  const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));
  if (remaining <= 0) return;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Monthly savings as a proxy: approved credit transactions minus debit transactions in 30d
  const aggregate = await prisma.transaction.aggregate({
    where: { userId, status: 'approved', transactionDate: { gte: thirtyDaysAgo } },
    _sum: { signedAmount: true },
  });

  const netMonthly = Number(aggregate._sum.signedAmount ?? 0);
  if (netMonthly <= 0) return; // Can't project if not saving

  const monthsToComplete = remaining / netMonthly;
  const projected = new Date();
  projected.setDate(projected.getDate() + Math.ceil(monthsToComplete * 30));

  await prisma.goal.update({
    where: { id: goalId },
    data: { projectedCompletionDate: projected },
  });
}
