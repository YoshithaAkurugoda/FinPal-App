import { prisma } from '../../lib/prisma.js';
import { computeAllWalletBalances, computeWalletBalance } from '../../services/ledger.service.js';

export async function createWallet(
  userId: string,
  data: { name: string; type: string; startingBalance: number },
) {
  const w = await prisma.wallet.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      startingBalance: data.startingBalance,
    },
  });
  const balance = await computeWalletBalance(w.id);
  return {
    ...w,
    startingBalance: Number(w.startingBalance),
    currentBalance: balance,
  };
}

export async function getWallets(userId: string) {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const balances = await computeAllWalletBalances(userId);

  return wallets.map((w) => ({
    ...w,
    startingBalance: Number(w.startingBalance),
    currentBalance: balances.get(w.id) ?? Number(w.startingBalance),
  }));
}

export async function getWalletById(userId: string, walletId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
  });

  if (!wallet) return null;

  const balance = await computeWalletBalance(walletId);

  return {
    ...wallet,
    startingBalance: Number(wallet.startingBalance),
    currentBalance: balance,
  };
}

export async function updateWallet(
  userId: string,
  walletId: string,
  data: { name?: string; type?: string },
) {
  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId } });
  if (!wallet) throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });

  const updated = await prisma.wallet.update({
    where: { id: walletId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
    },
  });

  const balance = await computeWalletBalance(walletId);
  return { ...updated, startingBalance: Number(updated.startingBalance), currentBalance: balance };
}

export async function deleteWallet(userId: string, walletId: string): Promise<void> {
  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId } });
  if (!wallet) throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });

  await prisma.wallet.delete({ where: { id: walletId } });
}
