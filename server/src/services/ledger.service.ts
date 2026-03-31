import { Decimal } from '@prisma/client/runtime/library';

import { prisma } from '../lib/prisma.js';

export async function computeWalletBalance(walletId: string): Promise<number> {
  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: { id: walletId },
    select: { startingBalance: true },
  });

  const aggregate = await prisma.transaction.aggregate({
    where: { walletId, status: 'approved' },
    _sum: { signedAmount: true },
  });

  const starting = Number(wallet.startingBalance);
  const txSum = Number(aggregate._sum.signedAmount ?? 0);

  return starting + txSum;
}

export async function computeAllWalletBalances(
  userId: string,
): Promise<Map<string, number>> {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    select: { id: true, startingBalance: true },
  });

  if (wallets.length === 0) return new Map();

  const walletIds = wallets.map((w) => w.id);

  const aggregates = await prisma.transaction.groupBy({
    by: ['walletId'],
    where: { walletId: { in: walletIds }, status: 'approved' },
    _sum: { signedAmount: true },
  });

  const sumMap = new Map<string, Decimal>();
  for (const agg of aggregates) {
    if (agg._sum.signedAmount) {
      sumMap.set(agg.walletId, agg._sum.signedAmount);
    }
  }

  const result = new Map<string, number>();
  for (const wallet of wallets) {
    const starting = Number(wallet.startingBalance);
    const txSum = Number(sumMap.get(wallet.id) ?? 0);
    result.set(wallet.id, starting + txSum);
  }

  return result;
}

export async function computeNetBalance(userId: string): Promise<number> {
  const balances = await computeAllWalletBalances(userId);
  let total = 0;
  for (const balance of balances.values()) {
    total += balance;
  }
  return total;
}
