import { prisma } from '../../lib/prisma.js';

export async function getMonthlyReport(userId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      status: 'approved',
      type: 'debit',
      transactionDate: { gte: startDate, lte: endDate },
    },
    orderBy: { transactionDate: 'desc' },
  });

  const categoryBreakdown: Record<string, { total: number; count: number }> = {};
  let totalSpend = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    totalSpend += amount;
    if (!categoryBreakdown[tx.category]) {
      categoryBreakdown[tx.category] = { total: 0, count: 0 };
    }
    categoryBreakdown[tx.category].total += amount;
    categoryBreakdown[tx.category].count += 1;
  }

  const categories = Object.entries(categoryBreakdown)
    .map(([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
      percentage: totalSpend > 0 ? Math.round((data.total / totalSpend) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    month,
    year,
    totalSpend: Math.round(totalSpend * 100) / 100,
    transactionCount: transactions.length,
    categories,
  };
}
