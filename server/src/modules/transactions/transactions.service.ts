import { prisma } from '../../lib/prisma.js';
import { invalidateBudgetCache, checkBudgetThresholds } from '../../services/budget.service.js';

function computeSignedAmount(type: string, amount: number): number {
  return type === 'debit' ? -Math.abs(amount) : Math.abs(amount);
}

export async function createManualTransaction(
  userId: string,
  data: {
    walletId: string;
    amount: number;
    type: string;
    merchant?: string;
    category: string;
    transactionDate: string;
  },
) {
  const signedAmount = computeSignedAmount(data.type, data.amount);

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      walletId: data.walletId,
      amount: data.amount,
      signedAmount,
      type: data.type,
      merchant: data.merchant,
      category: data.category,
      status: 'approved',
      source: 'manual',
      transactionDate: new Date(data.transactionDate),
    },
  });

  await invalidateBudgetCache(userId, data.category);
  await checkBudgetThresholds(userId, data.category);

  return transaction;
}

export async function getTransactions(
  userId: string,
  filters: {
    status?: string;
    category?: string;
    walletId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.walletId) where.walletId = filters.walletId;
  if (filters.startDate || filters.endDate) {
    where.transactionDate = {};
    if (filters.startDate) where.transactionDate.gte = new Date(filters.startDate);
    if (filters.endDate) where.transactionDate.lte = new Date(filters.endDate);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, page, limit };
}

export async function getPendingTransactions(userId: string) {
  return prisma.transaction.findMany({
    where: { userId, status: 'pending' },
    orderBy: { transactionDate: 'desc' },
  });
}

export async function approveTransaction(
  userId: string,
  transactionId: string,
  edits?: { merchant?: string; category?: string; amount?: number },
) {
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId, status: 'pending' },
  });

  if (!tx) {
    throw Object.assign(new Error('Transaction not found or not pending'), {
      statusCode: 404,
    });
  }

  const updateData: any = { status: 'approved' };

  if (edits?.merchant !== undefined) updateData.merchant = edits.merchant;
  if (edits?.category !== undefined) updateData.category = edits.category;
  if (edits?.amount !== undefined) {
    updateData.amount = edits.amount;
    updateData.signedAmount = computeSignedAmount(tx.type, edits.amount);
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
  });

  const category = edits?.category ?? tx.category;
  await invalidateBudgetCache(userId, category);
  if (tx.category !== category) {
    await invalidateBudgetCache(userId, tx.category);
  }
  await checkBudgetThresholds(userId, category);

  return updated;
}

export async function rejectTransaction(userId: string, transactionId: string) {
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId, status: 'pending' },
  });

  if (!tx) {
    throw Object.assign(new Error('Transaction not found or not pending'), {
      statusCode: 404,
    });
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'rejected' },
  });
}

export async function batchApproveTransactions(
  userId: string,
  transactionIds: string[],
): Promise<number> {
  const result = await prisma.$transaction(async (tx) => {
    const pending = await tx.transaction.findMany({
      where: { id: { in: transactionIds }, userId, status: 'pending' },
    });

    if (pending.length === 0) return 0;

    await tx.transaction.updateMany({
      where: { id: { in: pending.map((t) => t.id) } },
      data: { status: 'approved' },
    });

    return pending.length;
  });

  if (result > 0) {
    const txs = await prisma.transaction.findMany({
      where: { id: { in: transactionIds }, userId },
      select: { category: true },
    });

    const categories = [...new Set(txs.map((t) => t.category))];
    for (const cat of categories) {
      await invalidateBudgetCache(userId, cat);
      await checkBudgetThresholds(userId, cat);
    }
  }

  return result;
}
