import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.companionMemory.deleteMany({});
  await prisma.aiCheckin.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: ['demo@finpal.lk', 'akindu@finpal.lk'] } } });

  // 1. Demo user
  const passwordHash = await bcrypt.hash('Demo@1234', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@finpal.lk',
      passwordHash,
      name: 'Ashan Demo',
      monthlyIncome: 150000,
      currency: 'LKR',
    },
  });

  // 2. Wallets
  const bankWallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'Commercial Bank',
      type: 'bank',
      startingBalance: 500000,
    },
  });
  const cashWallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'Cash',
      type: 'cash',
      startingBalance: 20000,
    },
  });

  // 3. Approved transactions — last 60 days
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);

  const txData: Array<{
    walletId: string;
    amount: number;
    type: 'debit' | 'credit';
    merchant: string;
    category: string;
    daysAgo: number;
    notes?: string;
  }> = [
    { walletId: bankWallet.id, amount: 150000, type: 'credit', merchant: 'Employer', category: 'Income', daysAgo: 30 },
    { walletId: bankWallet.id, amount: 150000, type: 'credit', merchant: 'Employer', category: 'Income', daysAgo: 1 },
    { walletId: bankWallet.id, amount: 4500, type: 'debit', merchant: 'Keells Super', category: 'Groceries', daysAgo: 2 },
    { walletId: bankWallet.id, amount: 3200, type: 'debit', merchant: 'Keells Super', category: 'Groceries', daysAgo: 9 },
    { walletId: bankWallet.id, amount: 7800, type: 'debit', merchant: 'Keells Super', category: 'Groceries', daysAgo: 16 },
    { walletId: bankWallet.id, amount: 2400, type: 'debit', merchant: 'Cargills Food City', category: 'Groceries', daysAgo: 22 },
    { walletId: bankWallet.id, amount: 1850, type: 'debit', merchant: 'Pizza Hut', category: 'Dining', daysAgo: 3 },
    { walletId: bankWallet.id, amount: 980, type: 'debit', merchant: 'Burger King', category: 'Dining', daysAgo: 7 },
    { walletId: bankWallet.id, amount: 2200, type: 'debit', merchant: 'Ministry of Crab', category: 'Dining', daysAgo: 14 },
    { walletId: bankWallet.id, amount: 450, type: 'debit', merchant: 'PickMe', category: 'Transport', daysAgo: 1 },
    { walletId: bankWallet.id, amount: 380, type: 'debit', merchant: 'Uber', category: 'Transport', daysAgo: 4 },
    { walletId: bankWallet.id, amount: 1200, type: 'debit', merchant: 'Shell', category: 'Transport', daysAgo: 8 },
    { walletId: bankWallet.id, amount: 3500, type: 'debit', merchant: 'Laugfs', category: 'Utilities', daysAgo: 5 },
    { walletId: bankWallet.id, amount: 1800, type: 'debit', merchant: 'SLT Mobitel', category: 'Utilities', daysAgo: 12 },
    { walletId: bankWallet.id, amount: 12000, type: 'debit', merchant: 'Odel', category: 'Shopping', daysAgo: 6 },
    { walletId: bankWallet.id, amount: 4500, type: 'debit', merchant: 'Softlogic', category: 'Shopping', daysAgo: 20 },
    { walletId: bankWallet.id, amount: 2800, type: 'debit', merchant: 'Steam', category: 'Entertainment', daysAgo: 10 },
    { walletId: bankWallet.id, amount: 890, type: 'debit', merchant: 'Netflix', category: 'Entertainment', daysAgo: 15 },
    { walletId: cashWallet.id, amount: 550, type: 'debit', merchant: 'Street Food', category: 'Dining', daysAgo: 2 },
    { walletId: cashWallet.id, amount: 200, type: 'debit', merchant: 'Bus', category: 'Transport', daysAgo: 3 },
  ];

  for (const t of txData) {
    const signed = t.type === 'credit' ? t.amount : -t.amount;
    const approvedAt = daysAgo(t.daysAgo);
    await prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: t.walletId,
        amount: t.amount,
        signedAmount: signed,
        type: t.type,
        merchant: t.merchant,
        category: t.category,
        status: 'approved',
        source: 'manual',
        transactionDate: approvedAt,
        approvedAt,
        notes: t.notes ?? null,
      },
    });
  }

  // 4. Budgets
  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: 'Groceries', amountLimit: 20000, period: 'monthly' },
      { userId: user.id, category: 'Dining', amountLimit: 10000, period: 'monthly' },
      { userId: user.id, category: 'Transport', amountLimit: 8000, period: 'monthly', rollover: true },
    ],
  });

  // 5. Goals
  const sixMonths = new Date(now.getFullYear(), now.getMonth() + 6, 1);
  const oneYear = new Date(now.getFullYear() + 1, now.getMonth(), 1);
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        name: 'Emergency Fund',
        targetAmount: 300000,
        currentAmount: 75000,
        targetDate: oneYear,
        status: 'active',
      },
      {
        userId: user.id,
        name: 'New Laptop',
        targetAmount: 120000,
        currentAmount: 45000,
        targetDate: sixMonths,
        status: 'active',
      },
    ],
  });

  // 6. Companion memories
  await prisma.companionMemory.createMany({
    data: [
      { userId: user.id, type: 'preference', key: 'grocery_store', value: 'Prefers Keells Super for grocery shopping', confidence: 0.9, lastSeen: now },
      { userId: user.id, type: 'pattern', key: 'dining_frequency', value: 'Dines out roughly 3-4 times per week', confidence: 0.8, lastSeen: now },
      { userId: user.id, type: 'preference', key: 'transport_mode', value: 'Uses PickMe/Uber for commuting, occasional Shell fuel top-up', confidence: 0.75, lastSeen: now },
      { userId: user.id, type: 'goal', key: 'saving_motivation', value: 'Building emergency fund as top priority; also saving for a laptop', confidence: 0.95, lastSeen: now },
      { userId: user.id, type: 'pattern', key: 'income_day', value: 'Salary credited on approximately the 1st of each month (LKR 150,000)', confidence: 0.9, lastSeen: now },
    ],
  });

  // 7. AI check-in
  await prisma.aiCheckin.create({
    data: {
      userId: user.id,
      type: 'daily',
      content: "Good morning! You've spent LKR 18,450 so far this month — you're on track with your Groceries budget (70% used). Your Emergency Fund goal is at 25%, keep it up! Consider reducing dining out slightly to boost savings.",
      createdAt: daysAgo(0),
    },
  });

  console.log(`✅ Seeded demo user: demo@finpal.lk / Demo@1234`);
  console.log(`   Wallets: ${bankWallet.name}, ${cashWallet.name}`);
  console.log(`   Transactions: ${txData.length} approved`);
  console.log(`   Budgets: 3 | Goals: 2 | Memories: 5`);

  // ─── Akindu Abeysekara ────────────────────────────────────────────────────

  const akinduHash = await bcrypt.hash('Akindu@1234', 10);
  const akindu = await prisma.user.create({
    data: {
      email: 'akindu@finpal.lk',
      passwordHash: akinduHash,
      name: 'Akindu Abeysekara',
      monthlyIncome: 220000,
      currency: 'LKR',
    },
  });

  // Wallets
  const akinduBank = await prisma.wallet.create({
    data: { userId: akindu.id, name: 'Commercial Bank', type: 'bank', startingBalance: 850000 },
  });
  const akinduHNB = await prisma.wallet.create({
    data: { userId: akindu.id, name: 'HNB Savings', type: 'bank', startingBalance: 320000 },
  });
  const akinduCash = await prisma.wallet.create({
    data: { userId: akindu.id, name: 'Cash', type: 'cash', startingBalance: 15000 },
  });
  const akinduEwallet = await prisma.wallet.create({
    data: { userId: akindu.id, name: 'genie', type: 'ewallet', startingBalance: 5000 },
  });

  // Transactions — 60 days of realistic Sri Lankan spending
  const akinduTx: Array<{
    walletId: string;
    amount: number;
    type: 'debit' | 'credit';
    merchant: string;
    category: string;
    daysAgo: number;
  }> = [
    // Income — two months salary
    { walletId: akinduBank.id, amount: 220000, type: 'credit', merchant: 'Employer', category: 'Income', daysAgo: 54 },
    { walletId: akinduBank.id, amount: 220000, type: 'credit', merchant: 'Employer', category: 'Income', daysAgo: 24 },
    // Freelance
    { walletId: akinduBank.id, amount: 35000, type: 'credit', merchant: 'Freelance Client', category: 'Income', daysAgo: 40 },

    // Groceries
    { walletId: akinduBank.id, amount: 6800, type: 'debit', merchant: 'Keells Super', category: 'Groceries', daysAgo: 3 },
    { walletId: akinduBank.id, amount: 4200, type: 'debit', merchant: 'Cargills Food City', category: 'Groceries', daysAgo: 10 },
    { walletId: akinduBank.id, amount: 7500, type: 'debit', merchant: 'Keells Super', category: 'Groceries', daysAgo: 17 },
    { walletId: akinduBank.id, amount: 3900, type: 'debit', merchant: 'Laugfs Super', category: 'Groceries', daysAgo: 25 },
    { walletId: akinduBank.id, amount: 5100, type: 'debit', merchant: 'Keells Super', category: 'Groceries', daysAgo: 38 },
    { walletId: akinduBank.id, amount: 4600, type: 'debit', merchant: 'Cargills Food City', category: 'Groceries', daysAgo: 47 },

    // Dining
    { walletId: akinduBank.id, amount: 2800, type: 'debit', merchant: 'Ministry of Crab', category: 'Dining', daysAgo: 5 },
    { walletId: akinduBank.id, amount: 1450, type: 'debit', merchant: 'Burger King', category: 'Dining', daysAgo: 8 },
    { walletId: akinduBank.id, amount: 980,  type: 'debit', merchant: 'Pizza Hut', category: 'Dining', daysAgo: 12 },
    { walletId: akinduCash.id,  amount: 650,  type: 'debit', merchant: 'Kottu Spot', category: 'Dining', daysAgo: 14 },
    { walletId: akinduBank.id, amount: 3200, type: 'debit', merchant: 'Nana\'s Restaurant', category: 'Dining', daysAgo: 19 },
    { walletId: akinduCash.id,  amount: 420,  type: 'debit', merchant: 'Street Food', category: 'Dining', daysAgo: 21 },
    { walletId: akinduBank.id, amount: 1750, type: 'debit', merchant: 'KFC', category: 'Dining', daysAgo: 27 },
    { walletId: akinduCash.id,  amount: 580,  type: 'debit', merchant: 'Café Kumbuk', category: 'Dining', daysAgo: 33 },
    { walletId: akinduBank.id, amount: 2100, type: 'debit', merchant: 'Barefoot Café', category: 'Dining', daysAgo: 42 },
    { walletId: akinduCash.id,  amount: 380,  type: 'debit', merchant: 'Street Food', category: 'Dining', daysAgo: 50 },

    // Transport
    { walletId: akinduEwallet.id, amount: 520,  type: 'debit', merchant: 'PickMe', category: 'Transport', daysAgo: 2 },
    { walletId: akinduEwallet.id, amount: 480,  type: 'debit', merchant: 'Uber', category: 'Transport', daysAgo: 6 },
    { walletId: akinduBank.id,   amount: 2800, type: 'debit', merchant: 'Shell', category: 'Transport', daysAgo: 9 },
    { walletId: akinduEwallet.id, amount: 390,  type: 'debit', merchant: 'PickMe', category: 'Transport', daysAgo: 13 },
    { walletId: akinduEwallet.id, amount: 610,  type: 'debit', merchant: 'Uber', category: 'Transport', daysAgo: 18 },
    { walletId: akinduBank.id,   amount: 2600, type: 'debit', merchant: 'Lanka IOC', category: 'Transport', daysAgo: 31 },
    { walletId: akinduEwallet.id, amount: 440,  type: 'debit', merchant: 'PickMe', category: 'Transport', daysAgo: 36 },
    { walletId: akinduCash.id,   amount: 180,  type: 'debit', merchant: 'Bus', category: 'Transport', daysAgo: 45 },

    // Utilities
    { walletId: akinduBank.id, amount: 4200, type: 'debit', merchant: 'CEB', category: 'Utilities', daysAgo: 20 },
    { walletId: akinduBank.id, amount: 2400, type: 'debit', merchant: 'Dialog', category: 'Utilities', daysAgo: 22 },
    { walletId: akinduBank.id, amount: 1650, type: 'debit', merchant: 'SLT Mobitel', category: 'Utilities', daysAgo: 23 },
    { walletId: akinduBank.id, amount: 3800, type: 'debit', merchant: 'CEB', category: 'Utilities', daysAgo: 51 },
    { walletId: akinduBank.id, amount: 2200, type: 'debit', merchant: 'Dialog', category: 'Utilities', daysAgo: 53 },

    // Shopping
    { walletId: akinduBank.id, amount: 18500, type: 'debit', merchant: 'Abans', category: 'Shopping', daysAgo: 7 },
    { walletId: akinduBank.id, amount: 6800,  type: 'debit', merchant: 'Odel', category: 'Shopping', daysAgo: 15 },
    { walletId: akinduBank.id, amount: 3200,  type: 'debit', merchant: 'H&M', category: 'Shopping', daysAgo: 29 },
    { walletId: akinduBank.id, amount: 4500,  type: 'debit', merchant: 'Softlogic', category: 'Shopping', daysAgo: 44 },

    // Entertainment
    { walletId: akinduBank.id,   amount: 2990, type: 'debit', merchant: 'Steam', category: 'Entertainment', daysAgo: 4 },
    { walletId: akinduEwallet.id, amount: 990,  type: 'debit', merchant: 'Netflix', category: 'Entertainment', daysAgo: 16 },
    { walletId: akinduEwallet.id, amount: 990,  type: 'debit', merchant: 'Netflix', category: 'Entertainment', daysAgo: 46 },
    { walletId: akinduBank.id,   amount: 1800, type: 'debit', merchant: 'Scope Cinemas', category: 'Entertainment', daysAgo: 11 },
    { walletId: akinduBank.id,   amount: 1500, type: 'debit', merchant: 'Scope Cinemas', category: 'Entertainment', daysAgo: 35 },

    // Health
    { walletId: akinduBank.id, amount: 3500, type: 'debit', merchant: 'Nawaloka Hospital', category: 'Health', daysAgo: 26 },
    { walletId: akinduBank.id, amount: 1200, type: 'debit', merchant: 'Osusala Pharmacy', category: 'Health', daysAgo: 28 },

    // Savings transfer to HNB
    { walletId: akinduBank.id, amount: 30000, type: 'debit', merchant: 'Transfer to HNB', category: 'Savings', daysAgo: 23 },
    { walletId: akinduHNB.id,  amount: 30000, type: 'credit', merchant: 'Transfer from Commercial', category: 'Savings', daysAgo: 23 },
    { walletId: akinduBank.id, amount: 30000, type: 'debit', merchant: 'Transfer to HNB', category: 'Savings', daysAgo: 53 },
    { walletId: akinduHNB.id,  amount: 30000, type: 'credit', merchant: 'Transfer from Commercial', category: 'Savings', daysAgo: 53 },
  ];

  for (const t of akinduTx) {
    const signed = t.type === 'credit' ? t.amount : -t.amount;
    const date = daysAgo(t.daysAgo);
    await prisma.transaction.create({
      data: {
        userId: akindu.id,
        walletId: t.walletId,
        amount: t.amount,
        signedAmount: signed,
        type: t.type,
        merchant: t.merchant,
        category: t.category,
        status: 'approved',
        source: 'manual',
        transactionDate: date,
        approvedAt: date,
      },
    });
  }

  // Budgets
  await prisma.budget.createMany({
    data: [
      { userId: akindu.id, category: 'Groceries',    amountLimit: 25000, period: 'monthly' },
      { userId: akindu.id, category: 'Dining',       amountLimit: 15000, period: 'monthly' },
      { userId: akindu.id, category: 'Transport',    amountLimit: 10000, period: 'monthly', rollover: true },
      { userId: akindu.id, category: 'Shopping',     amountLimit: 20000, period: 'monthly' },
      { userId: akindu.id, category: 'Entertainment', amountLimit: 8000, period: 'monthly' },
      { userId: akindu.id, category: 'Utilities',    amountLimit: 12000, period: 'monthly' },
    ],
  });

  // Goals
  const oneYearOut  = new Date(now.getFullYear() + 1, now.getMonth(), 1);
  const eightMonths = new Date(now.getFullYear(), now.getMonth() + 8, 1);
  const threeMonths = new Date(now.getFullYear(), now.getMonth() + 3, 1);
  await prisma.goal.createMany({
    data: [
      { userId: akindu.id, name: 'Emergency Fund',  targetAmount: 500000, currentAmount: 120000, targetDate: oneYearOut,  status: 'active' },
      { userId: akindu.id, name: 'MacBook Pro',     targetAmount: 350000, currentAmount: 95000,  targetDate: eightMonths, status: 'active' },
      { userId: akindu.id, name: 'Vacation — Bali', targetAmount: 180000, currentAmount: 45000,  targetDate: threeMonths, status: 'active' },
    ],
  });

  // Companion memories
  await prisma.companionMemory.createMany({
    data: [
      { userId: akindu.id, type: 'preference', key: 'grocery_store',    value: 'Prefers Keells Super; also shops at Cargills', confidence: 0.9, lastSeen: now },
      { userId: akindu.id, type: 'pattern',    key: 'dining_frequency', value: 'Dines out 4-5 times per week; enjoys Ministry of Crab on weekends', confidence: 0.85, lastSeen: now },
      { userId: akindu.id, type: 'preference', key: 'transport',        value: 'Uses PickMe and Uber daily; owns a car (Shell/IOC top-ups)', confidence: 0.8, lastSeen: now },
      { userId: akindu.id, type: 'goal',       key: 'priorities',       value: 'Emergency Fund is top priority; saving for MacBook and Bali trip', confidence: 0.95, lastSeen: now },
      { userId: akindu.id, type: 'pattern',    key: 'income_pattern',   value: 'Salary of LKR 220,000 credited around 1st of month; occasional freelance income', confidence: 0.9, lastSeen: now },
    ],
  });

  // AI check-in
  await prisma.aiCheckin.create({
    data: {
      userId: akindu.id,
      type: 'daily',
      content: "Good morning, Akindu! This month you've earned LKR 220,000 and spent LKR 68,350 so far. Dining (LKR 13,180) is approaching your LKR 15,000 budget — consider cooking at home a couple of times this week. Your Emergency Fund is at 24% — you're on track. One tip: redirect your next dining saving toward the Bali vacation fund!",
      createdAt: daysAgo(0),
    },
  });

  console.log(`✅ Seeded Akindu: akindu@finpal.lk / Akindu@1234`);
  console.log(`   Wallets: 4 | Transactions: ${akinduTx.length} | Budgets: 6 | Goals: 3`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
