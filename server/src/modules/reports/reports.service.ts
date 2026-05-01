import { prisma } from '../../lib/prisma.js';

function monthLabel(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

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

export async function getMerchantReport(
  userId: string,
  from: string,
  to: string,
  category?: string,
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      status: 'approved',
      type: 'debit',
      merchant: { not: null },
      transactionDate: { gte: new Date(from), lte: new Date(to) },
      ...(category && { category }),
    },
    select: { merchant: true, amount: true },
  });

  const merchantMap: Record<string, { total: number; count: number }> = {};
  for (const tx of transactions) {
    const key = tx.merchant!;
    if (!merchantMap[key]) merchantMap[key] = { total: 0, count: 0 };
    merchantMap[key].total += Number(tx.amount);
    merchantMap[key].count += 1;
  }

  const merchants = Object.entries(merchantMap)
    .map(([merchant, data]) => ({
      merchant,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  return { from, to, merchants };
}

export async function getMonthOverMonth(userId: string, months = 6) {
  const snapshots = [];

  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date();
    ref.setDate(1);
    ref.setMonth(ref.getMonth() - i);
    const year = ref.getFullYear();
    const month = ref.getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: { userId, status: 'approved', type: 'debit', transactionDate: { gte: start, lte: end } },
      select: { amount: true, category: true },
    });

    const categories: Record<string, number> = {};
    let totalSpend = 0;
    for (const tx of transactions) {
      const amt = Number(tx.amount);
      totalSpend += amt;
      categories[tx.category] = (categories[tx.category] ?? 0) + amt;
    }

    snapshots.push({
      month,
      year,
      label: monthLabel(year, month),
      totalSpend: Math.round(totalSpend * 100) / 100,
      categories: Object.fromEntries(
        Object.entries(categories).map(([k, v]) => [k, Math.round(v * 100) / 100]),
      ),
    });
  }

  return { snapshots };
}

export async function getSavingsTrend(userId: string, months = 6) {
  const snapshots = [];

  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date();
    ref.setDate(1);
    ref.setMonth(ref.getMonth() - i);
    const year = ref.getFullYear();
    const month = ref.getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Income = sum of approved credits; expenses = sum of approved debits
    const [creditAgg, debitAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, status: 'approved', type: 'credit', transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, status: 'approved', type: 'debit', transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(creditAgg._sum.amount ?? 0);
    const expenses = Number(debitAgg._sum.amount ?? 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? savings / income : 0;

    snapshots.push({
      month,
      year,
      label: monthLabel(year, month),
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10000) / 100,
    });
  }

  return { snapshots };
}

export async function getIncomePercentages(userId: string, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  // Derive actual income from credit transactions that month
  const creditAgg = await prisma.transaction.aggregate({
    where: { userId, status: 'approved', type: 'credit', transactionDate: { gte: start, lte: end } },
    _sum: { amount: true },
  });
  const monthlyIncome = Number(creditAgg._sum.amount ?? 0);

  const report = await getMonthlyReport(userId, month, year);

  const categories = report.categories.map((c) => ({
    category: c.category,
    total: c.total,
    percentOfIncome: monthlyIncome > 0 ? Math.round((c.total / monthlyIncome) * 10000) / 100 : 0,
  }));

  return {
    month,
    year,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    categories,
    totalSpend: report.totalSpend,
    totalPercentOfIncome:
      monthlyIncome > 0 ? Math.round((report.totalSpend / monthlyIncome) * 10000) / 100 : 0,
  };
}
