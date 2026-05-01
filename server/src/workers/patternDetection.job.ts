import { prisma } from '../lib/prisma.js';
import { sendNotification } from '../services/notification.service.js';
import { computeNetBalance } from '../services/ledger.service.js';

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

async function detectAnomaliesForUser(userId: string): Promise<void> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const [historicalTx, recentTx, user, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        status: 'approved',
        type: 'debit',
        transactionDate: { gte: ninetyDaysAgo, lt: oneDayAgo },
      },
      select: { amount: true, category: true, merchant: true, transactionDate: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        status: 'approved',
        type: 'debit',
        transactionDate: { gte: oneDayAgo },
      },
      select: { id: true, amount: true, category: true, merchant: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true, monthlyIncome: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: 'active' },
      select: { name: true, targetAmount: true, currentAmount: true },
    }),
  ]);

  if (!user) return;

  // Build per-category stats from historical data
  const categoryAmounts: Record<string, number[]> = {};
  const knownMerchants = new Set<string>();

  for (const tx of historicalTx) {
    if (!categoryAmounts[tx.category]) categoryAmounts[tx.category] = [];
    categoryAmounts[tx.category].push(Number(tx.amount));
    if (tx.merchant) knownMerchants.add(tx.merchant.toLowerCase());
  }

  const alertFlagTtl = 6 * 3600; // 6 hours (matches run interval)

  for (const tx of recentTx) {
    const amounts = categoryAmounts[tx.category] ?? [];
    const avg = mean(amounts);
    const sd = stddev(amounts, avg);
    const txAmount = Number(tx.amount);

    // Unusual spend: more than 2 standard deviations above mean
    if (amounts.length >= 5 && avg > 0 && txAmount > avg + 2 * sd) {
      const alertKey = `pattern_alert:${userId}:unusual:${tx.id}`;
      const alreadySent = await checkAndSetFlag(alertKey, alertFlagTtl);
      if (!alreadySent) {
        await sendNotification(
          userId,
          'Unusual spending detected',
          `You spent ${user.currency} ${txAmount.toLocaleString()} on ${tx.category} — that's higher than your usual ${user.currency} ${Math.round(avg).toLocaleString()}.`,
          { type: 'unusual_transaction', transactionId: tx.id },
        );
        await prisma.aiCheckin.create({
          data: {
            userId,
            type: 'insight',
            content: `Unusual spending alert: You spent ${user.currency} ${txAmount.toLocaleString()} on ${tx.category}. Your typical spend in this category is around ${user.currency} ${Math.round(avg).toLocaleString()}.`,
          },
        });
      }
    }

    // New merchant alert
    if (tx.merchant && !knownMerchants.has(tx.merchant.toLowerCase())) {
      const alertKey = `pattern_alert:${userId}:newmerchant:${tx.id}`;
      const alreadySent = await checkAndSetFlag(alertKey, alertFlagTtl);
      if (!alreadySent) {
        await sendNotification(
          userId,
          'New merchant',
          `First transaction at "${tx.merchant}" for ${user.currency} ${txAmount.toLocaleString()}.`,
          { type: 'new_merchant' },
        );
      }
    }
  }

  // Surplus suggestion: if projected month-end surplus > sum of remaining goal amounts
  if (user.monthlyIncome && goals.length > 0) {
    const netBalance = await computeNetBalance(userId);
    const income = Number(user.monthlyIncome);

    // Estimate spend so far this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();

    const monthSpend = historicalTx
      .filter((t) => new Date(t.transactionDate) >= monthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const projectedMonthSpend = (monthSpend / dayOfMonth) * daysInMonth;
    const projectedSurplus = income - projectedMonthSpend;

    const totalGoalRemaining = goals.reduce(
      (sum, g) => sum + Math.max(0, Number(g.targetAmount) - Number(g.currentAmount)),
      0,
    );

    if (projectedSurplus > 0 && totalGoalRemaining > 0) {
      const suggestion = Math.min(projectedSurplus * 0.5, totalGoalRemaining);
      const flagKey = `pattern_alert:${userId}:surplus:${monthStart.toISOString().slice(0, 7)}`;
      const alreadySent = await checkAndSetFlag(flagKey, 30 * 24 * 3600);
      if (!alreadySent && suggestion > 0) {
        const topGoal = goals[0];
        await prisma.aiCheckin.create({
          data: {
            userId,
            type: 'suggestion',
            content: `You're on track to have ${user.currency} ${Math.round(projectedSurplus).toLocaleString()} left over this month. Consider putting ${user.currency} ${Math.round(suggestion).toLocaleString()} toward "${topGoal.name}".`,
          },
        });
        await sendNotification(
          userId,
          'Savings opportunity',
          `You could put ${user.currency} ${Math.round(suggestion).toLocaleString()} toward "${topGoal.name}" this month.`,
          { type: 'surplus_suggestion' },
        );
      }
    }
  }
}

// Use Redis flag to deduplicate alerts across runs
async function checkAndSetFlag(key: string, ttlSeconds: number): Promise<boolean> {
  try {
    const { redis } = await import('../config/redis.js');
    const existing = await redis.get(key);
    if (existing) return true;
    await redis.set(key, '1', 'EX', ttlSeconds);
    return false;
  } catch {
    return false;
  }
}

export async function processPatternDetectionJob(): Promise<void> {
  const batchSize = 10;
  let cursor: string | undefined;

  while (true) {
    const users = await prisma.user.findMany({
      select: { id: true },
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) break;

    await Promise.allSettled(users.map((u) => detectAnomaliesForUser(u.id)));

    if (users.length < batchSize) break;
    cursor = users[users.length - 1].id;
  }
}
