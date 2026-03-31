import { prisma } from '../../lib/prisma.js';
import { anthropic } from '../../lib/anthropic.js';
import { computeNetBalance, computeAllWalletBalances } from '../../services/ledger.service.js';
import { getBudgetSpend } from '../../services/budget.service.js';
import type { ChatMessage } from '@finpal/shared';

export async function buildFinancialContext(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [transactions, budgets, goals, wallets, netBalance] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, status: 'approved', transactionDate: { gte: thirtyDaysAgo } },
      orderBy: { transactionDate: 'desc' },
    }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId, status: 'active' } }),
    prisma.wallet.findMany({ where: { userId } }),
    computeNetBalance(userId),
  ]);

  const walletBalances = await computeAllWalletBalances(userId);

  const categorySpend: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === 'debit') {
      categorySpend[tx.category] = (categorySpend[tx.category] ?? 0) + Number(tx.amount);
    }
  }

  const budgetStatuses = await Promise.all(
    budgets.map(async (b) => {
      const spent = await getBudgetSpend(userId, b.category, b.period as 'monthly' | 'weekly');
      return {
        category: b.category,
        limit: Number(b.amountLimit),
        spent,
        remaining: Math.max(0, Number(b.amountLimit) - spent),
        period: b.period,
      };
    }),
  );

  return {
    netBalance,
    wallets: wallets.map((w) => ({
      name: w.name,
      type: w.type,
      balance: walletBalances.get(w.id) ?? Number(w.startingBalance),
    })),
    categorySpend,
    budgetStatuses,
    goals: goals.map((g) => ({
      name: g.name,
      target: Number(g.targetAmount),
      current: Number(g.currentAmount),
      targetDate: g.targetDate,
    })),
    transactionCount: transactions.length,
  };
}

export async function buildSystemPrompt(userId: string): Promise<string> {
  const [user, financial, memories] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    buildFinancialContext(userId),
    prisma.companionMemory.findMany({ where: { userId }, orderBy: { lastSeen: 'desc' }, take: 50 }),
  ]);

  const memoryBlock = memories.length > 0
    ? memories.map((m) => `- [${m.type}] ${m.key}: ${m.value} (confidence: ${m.confidence})`).join('\n')
    : 'No memories recorded yet.';

  return `You are FinPal, a friendly and knowledgeable personal finance companion for ${user.name}.
Currency: ${user.currency}. Monthly income: ${user.monthlyIncome ? Number(user.monthlyIncome) : 'not set'}.

FINANCIAL STATE:
- Net balance: ${financial.netBalance.toLocaleString()} ${user.currency}
- Wallets: ${financial.wallets.map((w) => `${w.name} (${w.type}): ${w.balance.toLocaleString()}`).join(', ')}
- Last 30 days spending by category: ${JSON.stringify(financial.categorySpend)}
- Budget statuses: ${financial.budgetStatuses.map((b) => `${b.category}: ${b.spent}/${b.limit} ${b.period}`).join(', ')}
- Active goals: ${financial.goals.map((g) => `${g.name}: ${g.current}/${g.target}`).join(', ')}

COMPANION MEMORIES:
${memoryBlock}

INSTRUCTIONS:
- Be warm, concise, and proactive with financial advice
- Reference the user's actual financial data when answering
- Suggest actionable steps, not just general advice
- If you notice concerning patterns (overspending, missed goals), mention them gently
- Keep responses focused and under 300 words unless the user asks for detail`;
}

export async function handleChat(userId: string, messages: ChatMessage[]): Promise<string> {
  const systemPrompt = await buildSystemPrompt(userId);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.text ?? 'I wasn\'t able to generate a response. Please try again.';
}

export async function getInsights(userId: string, type?: string, limit = 10) {
  return prisma.aiCheckin.findMany({
    where: {
      userId,
      ...(type && { type }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getLatestCheckin(userId: string) {
  return prisma.aiCheckin.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
