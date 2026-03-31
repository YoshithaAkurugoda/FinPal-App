import { prisma } from '../../lib/prisma.js';
import { computeWalletBalance } from '../../services/ledger.service.js';

export async function getReconciliationStatus(userId: string, walletId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
  });

  if (!wallet) {
    throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
  }

  const computedBalance = await computeWalletBalance(walletId);

  const lastReconciliation = await prisma.reconciliation.findFirst({
    where: { walletId, userId },
    orderBy: { reconciledAt: 'desc' },
  });

  return {
    walletId,
    computedBalance,
    lastReconciliation: lastReconciliation
      ? {
          id: lastReconciliation.id,
          statedBalance: Number(lastReconciliation.statedBalance),
          computedBalance: Number(lastReconciliation.computedBalance),
          discrepancy: Number(lastReconciliation.discrepancy),
          reconciledAt: lastReconciliation.reconciledAt,
        }
      : null,
  };
}

export async function submitReconciliation(
  userId: string,
  data: { walletId: string; statedBalance: number; note?: string },
) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: data.walletId, userId },
  });

  if (!wallet) {
    throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
  }

  const computedBalance = await computeWalletBalance(data.walletId);
  const discrepancy = data.statedBalance - computedBalance;

  const reconciliation = await prisma.reconciliation.create({
    data: {
      userId,
      walletId: data.walletId,
      statedBalance: data.statedBalance,
      computedBalance,
      discrepancy,
      reconciledAt: new Date(),
    },
  });

  let adjustmentTransaction = null;

  if (discrepancy !== 0 && data.note) {
    const type = discrepancy > 0 ? 'credit' : 'debit';
    const amount = Math.abs(discrepancy);

    adjustmentTransaction = await prisma.transaction.create({
      data: {
        userId,
        walletId: data.walletId,
        amount,
        signedAmount: discrepancy,
        type,
        category: 'Other',
        status: 'approved',
        source: 'reconciliation',
        rawInput: data.note,
        transactionDate: new Date(),
        metadata: { reconciliationId: reconciliation.id },
      },
    });
  }

  return {
    reconciliation: {
      ...reconciliation,
      statedBalance: Number(reconciliation.statedBalance),
      computedBalance: Number(reconciliation.computedBalance),
      discrepancy: Number(reconciliation.discrepancy),
    },
    adjustmentTransaction,
  };
}
