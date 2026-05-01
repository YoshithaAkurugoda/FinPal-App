import { prisma } from '../../lib/prisma.js';
import { generateText } from '../../lib/ai-provider.js';
import { computeNetBalance, computeAllWalletBalances } from '../../services/ledger.service.js';
import { getBudgetSpend } from '../../services/budget.service.js';
import type { ChatMessage } from '@finpal/shared';

export async function buildFinancialContext(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [transactions, budgets, goals, wallets, netBalance, creditAgg, debitAgg] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, status: 'approved', transactionDate: { gte: thirtyDaysAgo } },
      orderBy: { transactionDate: 'desc' },
    }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId, status: 'active' } }),
    prisma.wallet.findMany({ where: { userId } }),
    computeNetBalance(userId),
    // Actual income and expenses from approved transactions in the last 30 days
    prisma.transaction.aggregate({
      where: { userId, status: 'approved', type: 'credit', transactionDate: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, status: 'approved', type: 'debit', transactionDate: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
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

  const totalIncome30d = Number(creditAgg._sum.amount ?? 0);
  const totalExpenses30d = Number(debitAgg._sum.amount ?? 0);

  return {
    netBalance,
    totalIncome30d,
    totalExpenses30d,
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

type ContextSection = 'wallets' | 'spending' | 'budgets' | 'goals' | 'memories';

function detectNeededSections(messages: ChatMessage[]): Set<ContextSection> {
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content.toLowerCase() ?? '';
  const needed = new Set<ContextSection>();
  if (/balance|wallet|account|bank|money|total|how much/.test(last)) needed.add('wallets');
  if (/spend|spent|bought|pay|paid|category|groceries|food|dining|transport|shopping/.test(last)) needed.add('spending');
  if (/budget|limit|over|remaining|allowance/.test(last)) needed.add('budgets');
  if (/goal|saving|save|target|invest|emergency/.test(last)) needed.add('goals');
  if (/remember|recall|usually|prefer|always|habit/.test(last)) needed.add('memories');
  // Vague / overview questions → include everything (safe fallback)
  if (needed.size === 0) {
    needed.add('wallets');
    needed.add('spending');
    needed.add('budgets');
    needed.add('goals');
    needed.add('memories');
  }
  return needed;
}

export async function buildSystemPrompt(userId: string, messages: ChatMessage[]): Promise<string> {
  const sections = detectNeededSections(messages);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Always fetch: user + net balance + 30-day income/expense totals
  const [user, netBalance, creditAgg, debitAgg] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    computeNetBalance(userId),
    prisma.transaction.aggregate({
      where: { userId, status: 'approved', type: 'credit', transactionDate: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, status: 'approved', type: 'debit', transactionDate: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
  ]);

  const income30d = Number(creditAgg._sum.amount ?? 0);
  const expenses30d = Number(debitAgg._sum.amount ?? 0);
  const savings30d = income30d - expenses30d;

  // Fetch only what the detected sections need
  const [wallets, walletBalances, transactions, budgets, goals, memories] = await Promise.all([
    sections.has('wallets') ? prisma.wallet.findMany({ where: { userId } }) : Promise.resolve([]),
    sections.has('wallets') ? computeAllWalletBalances(userId) : Promise.resolve(new Map<string, number>()),
    sections.has('spending') || sections.has('budgets')
      ? prisma.transaction.findMany({
          where: { userId, status: 'approved', transactionDate: { gte: thirtyDaysAgo } },
          orderBy: { transactionDate: 'desc' },
        })
      : Promise.resolve([]),
    sections.has('budgets') ? prisma.budget.findMany({ where: { userId } }) : Promise.resolve([]),
    sections.has('goals') ? prisma.goal.findMany({ where: { userId, status: 'active' } }) : Promise.resolve([]),
    sections.has('memories')
      ? prisma.companionMemory.findMany({ where: { userId }, orderBy: { lastSeen: 'desc' }, take: 5 })
      : Promise.resolve([]),
  ]);

  const compact = (n: number): string => {
    const r = Math.round(n);
    if (Math.abs(r) >= 1000) return `${(r / 1000).toFixed(1)}k`;
    return String(r);
  };

  const financialLines: string[] = [];

  // Income / expenses / savings (always shown — core to financial health)
  financialLines.push(
    `- 30d income: ${compact(income30d)} | expenses: ${compact(expenses30d)} | savings: ${compact(savings30d)}`,
  );
  if (income30d > 0) {
    const savingsRate = Math.round((savings30d / income30d) * 100);
    financialLines.push(`- Savings rate: ${savingsRate}%`);
  }

  if (sections.has('wallets') && wallets.length > 0) {
    const list = wallets
      .slice(0, 5)
      .map((w) => `${w.name}:${compact(walletBalances.get(w.id) ?? Number(w.startingBalance))}`)
      .join(', ');
    financialLines.push(`- Wallets: ${list}`);
  }

  if (sections.has('spending')) {
    const categorySpend: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'debit') {
        categorySpend[tx.category] = (categorySpend[tx.category] ?? 0) + Number(tx.amount);
      }
    }
    const top = Object.entries(categorySpend).sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (top.length > 0) {
      financialLines.push(`- Top spend 30d: ${top.map(([cat, amt]) => `${cat}:${compact(amt)}`).join(', ')}`);
    }
  }

  if (sections.has('budgets') && budgets.length > 0) {
    const budgetStatuses = await Promise.all(
      budgets.map(async (b) => {
        const spent = await getBudgetSpend(userId, b.category, b.period as 'monthly' | 'weekly');
        const limit = Number(b.amountLimit);
        const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        return { category: b.category, limit, spent, pct };
      }),
    );
    // Show all budgets, flag over-budget ones
    const lines = budgetStatuses.map(
      (b) => `${b.category}:${compact(b.spent)}/${compact(b.limit)}(${b.pct}%${b.pct >= 100 ? '⚠' : ''})`,
    );
    financialLines.push(`- Budgets: ${lines.join(', ')}`);
  }

  if (sections.has('goals') && goals.length > 0) {
    const goalLines = goals.slice(0, 3).map((g) => {
      const current = Number(g.currentAmount);
      const target = Number(g.targetAmount);
      const pct = target > 0 ? Math.round((current / target) * 100) : 0;
      return `${g.name}:${compact(current)}/${compact(target)}(${pct}%)`;
    });
    financialLines.push(`- Goals: ${goalLines.join(', ')}`);
  }

  const memoryBlock =
    sections.has('memories') && memories.length > 0
      ? `\nMemories: ${memories.slice(0, 3).map((m) => `${m.key}=${m.value}`).join('; ')}`
      : '';

  return `You are FinPal, a concise personal finance companion for ${user.name} (currency: ${user.currency}).
Net worth: ${compact(netBalance)} ${user.currency}
${financialLines.join('\n')}${memoryBlock}

All amounts are in ${user.currency}. Answer using only the data above — do not invent numbers. Be warm, specific, and under 120 words. Suggest one concrete next step.`;
}

type Intent = 'wallets' | 'spending' | 'budgets' | 'goals' | null;

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/how much.*money|my balance|wallets?\b|across my wallets|total balance|net worth/.test(t)) return 'wallets';
  if (/spend the most|top spending|where.*spend|biggest expense|spending breakdown/.test(t)) return 'spending';
  if (/my budgets?\b|budget status|how.*doing on.*budget|budget progress/.test(t)) return 'budgets';
  if (/goal progress|my goals?\b|savings goals?|progress on.*goal/.test(t)) return 'goals';
  return null;
}

function fmt(n: number, currency: string): string {
  const rounded = Math.round(n);
  return `${rounded.toLocaleString()} ${currency}`;
}

async function answerDeterministic(userId: string, intent: Intent): Promise<string | null> {
  if (!intent) return null;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const currency = user.currency;

  if (intent === 'wallets') {
    const [wallets, balances, net] = await Promise.all([
      prisma.wallet.findMany({ where: { userId } }),
      computeAllWalletBalances(userId),
      computeNetBalance(userId),
    ]);
    if (wallets.length === 0) return 'You don\'t have any wallets set up yet. Add one to start tracking your balance.';
    const lines = wallets
      .map((w) => `• ${w.name} (${w.type}): ${fmt(balances.get(w.id) ?? Number(w.startingBalance), currency)}`)
      .join('\n');
    return `Your net balance is ${fmt(net, currency)}.\n\n${lines}`;
  }

  if (intent === 'spending') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const transactions = await prisma.transaction.findMany({
      where: { userId, status: 'approved', type: 'debit', transactionDate: { gte: thirtyDaysAgo } },
      select: { category: true, amount: true },
    });
    if (transactions.length === 0) return 'No approved spending in the last 30 days yet.';
    const totals: Record<string, number> = {};
    for (const tx of transactions) {
      totals[tx.category] = (totals[tx.category] ?? 0) + Number(tx.amount);
    }
    const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const lines = top.map(([cat, amt]) => `• ${cat}: ${fmt(amt, currency)} (${Math.round((amt / total) * 100)}%)`).join('\n');
    return `Top spending in the last 30 days (${fmt(total, currency)} total):\n\n${lines}`;
  }

  if (intent === 'budgets') {
    const budgets = await prisma.budget.findMany({ where: { userId } });
    if (budgets.length === 0) return 'You haven\'t set up any budgets yet. Create one to track spending against a limit.';
    const rows = await Promise.all(
      budgets.map(async (b) => {
        const spent = await getBudgetSpend(userId, b.category, b.period as 'monthly' | 'weekly');
        const limit = Number(b.amountLimit);
        const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        const flag = pct >= 100 ? ' ⚠ over' : pct >= 80 ? ' ⚠ close' : '';
        return `• ${b.category} (${b.period}): ${fmt(spent, currency)} / ${fmt(limit, currency)} — ${pct}%${flag}`;
      }),
    );
    return `Budget status:\n\n${rows.join('\n')}`;
  }

  if (intent === 'goals') {
    const goals = await prisma.goal.findMany({ where: { userId, status: 'active' } });
    if (goals.length === 0) return 'You don\'t have any active savings goals. Create one to start tracking progress.';
    const lines = goals.map((g) => {
      const current = Number(g.currentAmount);
      const target = Number(g.targetAmount);
      const pct = target > 0 ? Math.round((current / target) * 100) : 0;
      const due = g.targetDate ? ` (by ${new Date(g.targetDate).toISOString().slice(0, 10)})` : '';
      return `• ${g.name}: ${fmt(current, currency)} / ${fmt(target, currency)} — ${pct}%${due}`;
    });
    return `Goal progress:\n\n${lines.join('\n')}`;
  }

  return null;
}

export async function handleChat(userId: string, messages: ChatMessage[]): Promise<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const intent = detectIntent(lastUser);
  const deterministic = await answerDeterministic(userId, intent);
  if (deterministic) return deterministic;

  const systemPrompt = await buildSystemPrompt(userId, messages);

  const text = await generateText({
    system: systemPrompt,
    messages: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
    maxTokens: 384,
    maxRetries: 1,
  });

  return text || 'I wasn\'t able to generate a response. Please try again.';
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
