import { generateText } from '../lib/ai-provider.js';
import { prisma } from '../lib/prisma.js';
import { buildFinancialContext } from '../modules/ai/ai.service.js';
import { sendNotification } from '../services/notification.service.js';

async function generateCheckin(
  userId: string,
  type: 'daily' | 'weekly',
): Promise<void> {
  const [user, financial] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    buildFinancialContext(userId),
  ]);

  const currency = user.currency;

  let systemPrompt: string;
  let userPrompt: string;

  const fmt = (n: number) => Math.round(n).toLocaleString();
  const savingsRate = financial.totalIncome30d > 0
    ? Math.round((( financial.totalIncome30d - financial.totalExpenses30d) / financial.totalIncome30d) * 100)
    : 0;

  if (type === 'daily') {
    systemPrompt = `You are FinPal, a friendly personal finance companion. Generate a concise daily check-in for ${user.name}.
Currency: ${currency}. Keep it under 200 words. Be warm and actionable. Use only the provided data — do not invent numbers.`;

    userPrompt = `Generate a morning financial summary based on this data:
Net balance: ${fmt(financial.netBalance)} ${currency}
30-day income: ${fmt(financial.totalIncome30d)} ${currency}
30-day expenses: ${fmt(financial.totalExpenses30d)} ${currency}
30-day savings: ${fmt(financial.totalIncome30d - financial.totalExpenses30d)} ${currency} (${savingsRate}% savings rate)
Spending by category (30d): ${Object.entries(financial.categorySpend).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `${cat}: ${fmt(amt)}`).join(', ') || 'none'}
Budget statuses: ${financial.budgetStatuses.map((b) => `${b.category} (${b.period}): ${fmt(b.spent)}/${fmt(b.limit)} ${b.limit > 0 ? Math.round((b.spent / b.limit) * 100) + '%' : ''}`).join(', ') || 'none'}
Active goals: ${financial.goals.map((g) => `${g.name}: ${fmt(g.current)}/${fmt(g.target)} (${g.target > 0 ? Math.round((g.current / g.target) * 100) : 0}%)`).join(', ') || 'none'}
Wallets: ${financial.wallets.map((w) => `${w.name}: ${fmt(w.balance)}`).join(', ')}

Highlight any budgets near their limit, celebrate goal progress if any, and offer one actionable suggestion.`;
  } else {
    systemPrompt = `You are FinPal, a friendly personal finance companion. Generate a weekly financial summary for ${user.name}.
Currency: ${currency}. Keep it under 300 words. Be encouraging and insightful. Use only the provided data — do not invent numbers.`;

    userPrompt = `Generate a weekly financial summary based on this data:
Net balance: ${fmt(financial.netBalance)} ${currency}
30-day income: ${fmt(financial.totalIncome30d)} ${currency}
30-day expenses: ${fmt(financial.totalExpenses30d)} ${currency}
30-day savings: ${fmt(financial.totalIncome30d - financial.totalExpenses30d)} ${currency} (${savingsRate}% savings rate)
Transactions this period: ${financial.transactionCount}
Spending by category: ${Object.entries(financial.categorySpend).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `${cat}: ${fmt(amt)}`).join(', ') || 'none'}
Budget statuses: ${financial.budgetStatuses.map((b) => `${b.category} (${b.period}): ${fmt(b.spent)}/${fmt(b.limit)} ${b.limit > 0 ? Math.round((b.spent / b.limit) * 100) + '%' : ''}`).join(', ') || 'none'}
Goals: ${financial.goals.map((g) => `${g.name}: ${fmt(g.current)}/${fmt(g.target)} (${g.target > 0 ? Math.round((g.current / g.target) * 100) : 0}%)`).join(', ') || 'none'}

Summarise: top spending categories, savings performance, any budget concerns, and one concrete suggestion for the week ahead.`;
  }

  const content = await generateText({
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 512,
  }) || 'Unable to generate check-in.';

  await prisma.aiCheckin.create({
    data: {
      userId,
      type,
      content,
    },
  });

  const title = type === 'daily'
    ? `Good morning, ${user.name}!`
    : `Your weekly summary is ready`;
  const body = type === 'daily'
    ? 'Your daily financial summary is ready'
    : 'See how your finances fared this week';

  await sendNotification(userId, title, body, { type: `ai_${type}` });
}

export async function processAiInsightJob(jobName: string): Promise<void> {
  const type = jobName === 'weekly_summary' ? 'weekly' : 'daily';

  // Process all users in batches of 10 to avoid overwhelming the AI API
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

    await Promise.allSettled(
      users.map((u) => generateCheckin(u.id, type)),
    );

    if (users.length < batchSize) break;
    cursor = users[users.length - 1].id;
  }
}
