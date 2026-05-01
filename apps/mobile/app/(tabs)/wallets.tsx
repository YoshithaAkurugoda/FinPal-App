import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useWalletStore, Wallet, WalletType } from '@/stores/walletStore';
import { useBudgetStore, BudgetWithStatus } from '@/stores/budgetStore';
import { useGoalStore } from '@/stores/goalStore';
import { useAiStore } from '@/stores/aiStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCurrency, formatAmount, formatNumber } from '@/lib/format';
import Input from '@/components/Input';
import Button from '@/components/Button';

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  groceries:     { icon: 'cart-outline',        color: '#22C55E' },
  dining:        { icon: 'restaurant-outline',  color: '#F59E0B' },
  transport:     { icon: 'car-outline',         color: '#3B82F6' },
  health:        { icon: 'medical-outline',     color: '#EF4444' },
  shopping:      { icon: 'bag-outline',         color: '#EC4899' },
  entertainment: { icon: 'film-outline',        color: '#8B5CF6' },
  utilities:     { icon: 'flash-outline',       color: '#06B6D4' },
  savings:       { icon: 'wallet-outline',      color: '#10B981' },
  other:         { icon: 'grid-outline',        color: '#94A3B8' },
};

function BudgetProgressBar({ progress, warning }: { progress: number; warning: boolean }) {
  const pct = Math.min(progress, 1);
  const color = pct >= 0.9 ? theme.colors.danger : pct >= 0.75 ? theme.colors.warning : theme.colors.primary;
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 5,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

function BudgetCard({ budget, currency }: { budget: BudgetWithStatus; currency: string }) {
  const cat = budget.category.toLowerCase();
  const cfg = CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.other;
  const pct = Math.round(budget.progress * 100);
  const isWarning = budget.progress >= 0.9;
  const spent = formatAmount(budget.spent, currency);
  const limit = formatAmount(budget.limit, currency);

  const advice = isWarning
    ? `${100 - pct}% budget remaining. Consider reducing ${budget.category} spend.`
    : budget.progress >= 0.75
    ? `Approaching limit. ${100 - pct}% remains.`
    : `On track. ${formatAmount(budget.remaining, currency)} remains.`;

  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetTop}>
        <View style={styles.budgetLeft}>
          <View style={[styles.catIcon, { backgroundColor: cfg.color + '20' }]}>
            <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
          </View>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetCategory}>
              {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
            </Text>
            <Text style={styles.budgetAmounts}>
              {spent} <Text style={styles.budgetOf}>/ {limit}</Text>
            </Text>
          </View>
        </View>
        <View style={styles.budgetRight}>
          {isWarning ? (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>WARNING</Text>
            </View>
          ) : (
            <Text style={styles.budgetPct}>{pct}% Used</Text>
          )}
        </View>
      </View>
      <View style={styles.budgetBarRow}>
        <BudgetProgressBar progress={budget.progress} warning={isWarning} />
      </View>
      <Text style={styles.budgetAdvice}>{advice}</Text>
    </View>
  );
}

function WalletRow({ wallet, onPress, currency }: { wallet: Wallet; onPress: () => void; currency: string }) {
  const TYPE_ICONS: Record<WalletType, string> = {
    bank: 'business-outline',
    cash: 'cash-outline',
    ewallet: 'phone-portrait-outline',
  };
  const balance = formatAmount(wallet.currentBalance ?? 0, currency);
  return (
    <TouchableOpacity style={styles.walletRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.walletIconBox}>
        <Ionicons name={TYPE_ICONS[wallet.type] as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.walletInfo}>
        <Text style={styles.walletName}>{wallet.name}</Text>
        <Text style={styles.walletType}>{wallet.type.toUpperCase()}</Text>
      </View>
      <View style={styles.walletBalanceBox}>
        <Text style={styles.walletBalance}>{balance}</Text>
        <View style={styles.walletBadge}>
          <Text style={styles.walletBadgeText}>Active</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const TYPE_LABELS: Record<WalletType, string> = { bank: 'Bank', cash: 'Cash', ewallet: 'E-Wallet' };

export default function WalletsTab() {
  const router = useRouter();
  const { wallets, totalBalance, fetchWallets, createWallet } = useWalletStore();
  const { budgets, fetchBudgets } = useBudgetStore();
  const { goals, fetchGoals } = useGoalStore();
  const { latestCheckin } = useAiStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const currency = useCurrency();

  const [refreshing, setRefreshing] = useState(false);
  const [showNewWallet, setShowNewWallet] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<WalletType>('bank');
  const [newBalance, setNewBalance] = useState('');
  const [creating, setCreating] = useState(false);

  const loadAll = useCallback(async () => {
    await Promise.all([fetchWallets(), fetchBudgets(), fetchGoals(), fetchTransactions({ limit: 10 })]);
  }, []);

  useEffect(() => { loadAll(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleCreateWallet = async () => {
    if (!newName.trim()) {
      Alert.alert('Missing Name', 'Please enter a wallet name.');
      return;
    }
    setCreating(true);
    try {
      await createWallet({ name: newName.trim(), type: newType, startingBalance: parseFloat(newBalance) || 0 });
      setShowNewWallet(false);
      setNewName(''); setNewBalance(''); setNewType('bank');
    } catch {
      Alert.alert('Error', 'Failed to create wallet.');
    } finally {
      setCreating(false);
    }
  };

  const formattedTotal = formatAmount(totalBalance, currency);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.liquidityLabel}>TOTAL LIQUIDITY</Text>
          <Text style={styles.liquidityAmount}>{formattedTotal}</Text>
        </View>

        {/* Monthly Budgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly Budgets</Text>
            <TouchableOpacity onPress={() => router.push('/budgets')} activeOpacity={0.7}>
              <Text style={styles.sectionLink}>View Detailed Insights →</Text>
            </TouchableOpacity>
          </View>
          {budgets.length > 0 ? (
            budgets.map((b) => <BudgetCard key={b.id} budget={b} currency={currency} />)
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No budgets yet</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.newCategoryBtn}
            onPress={() => router.push('/budgets/new')}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.newCategoryText}>New Category</Text>
          </TouchableOpacity>
        </View>

        {/* My Wallets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Wallets</Text>
            <TouchableOpacity
              style={styles.addCircleBtn}
              onPress={() => setShowNewWallet(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.walletListCard}>
            {wallets.length > 0 ? (
              wallets.map((w, i) => (
                <React.Fragment key={w.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <WalletRow wallet={w} onPress={() => router.push(`/wallets/${w.id}` as any)} currency={currency} />
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No wallets yet. Tap + to add one.</Text>
              </View>
            )}
          </View>
        </View>

        {/* AI Insight */}
        {latestCheckin && (
          <TouchableOpacity
            style={styles.aiInsightCard}
            onPress={() => router.push('/ai/insights')}
            activeOpacity={0.8}
          >
            <View style={styles.aiInsightHeader}>
              <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
              <Text style={styles.aiInsightLabel}>AI INSIGHT</Text>
            </View>
            <Text style={styles.aiInsightText} numberOfLines={3}>
              {latestCheckin.content}
            </Text>
            <TouchableOpacity
              style={styles.aiInsightBtn}
              onPress={() => router.push('/ai/insights')}
              activeOpacity={0.8}
            >
              <Text style={styles.aiInsightBtnText}>View Full Analysis</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Savings Goals</Text>
              <TouchableOpacity onPress={() => router.push('/goals/new')} activeOpacity={0.7}>
                <Text style={styles.sectionLink}>+ New</Text>
              </TouchableOpacity>
            </View>
            {goals.map((g) => {
              const pct = Math.round(g.progress * 100);
              const current = formatAmount(g.currentAmount, currency);
              const target = formatAmount(g.targetAmount, currency);
              return (
                <TouchableOpacity
                  key={g.id}
                  style={styles.goalCard}
                  onPress={() => router.push(`/goals/${g.id}`)}
                  activeOpacity={0.75}
                >
                  <View style={styles.goalTop}>
                    <Text style={styles.goalName} numberOfLines={1}>{g.name}</Text>
                    <Text style={styles.goalPct}>{pct}%</Text>
                  </View>
                  <View style={barStyles.track}>
                    <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: theme.colors.primary }]} />
                  </View>
                  <Text style={styles.goalAmounts}>{current} / {target}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Recent Allocation */}
        {transactions.slice(0, 5).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Allocation</Text>
            <View style={styles.allocationCard}>
              <View style={styles.allocationHeader}>
                <Text style={styles.allocationColDescription}>DESCRIPTION</Text>
                <Text style={styles.allocationColStatus}>STATUS</Text>
              </View>
              {transactions.slice(0, 5).map((tx) => {
                const isDebit = tx.type === 'debit';
                const rawAmt = formatAmount(Number(tx.amount), currency);
                const amount = `${isDebit ? '-' : '+'}${rawAmt}`;
                return (
                  <View key={tx.id} style={styles.allocationRow}>
                    <View style={styles.allocationLeft}>
                      <Text style={styles.allocationMerchant} numberOfLines={1}>
                        {tx.merchant || 'Unknown'}
                      </Text>
                      <Text style={styles.allocationMeta}>
                        {tx.category} · {tx.date ? new Date(tx.date).toLocaleDateString() : ''}
                      </Text>
                    </View>
                    <Text style={[styles.allocationAmount, { color: isDebit ? theme.colors.danger : theme.colors.primary }]}>
                      {amount}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Add Wallet Modal */}
      <Modal visible={showNewWallet} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalCard}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Wallet</Text>
              <TouchableOpacity onPress={() => setShowNewWallet(false)}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Input
              label="Wallet Name"
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Savings Account"
            />
            <Text style={styles.typeLabel}>Type</Text>
            <View style={styles.typeRow}>
              {(['bank', 'cash', 'ewallet'] as WalletType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, newType === t && styles.typeBtnActive]}
                  onPress={() => setNewType(t)}
                >
                  <Text style={[styles.typeText, newType === t && styles.typeTextActive]}>
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label="Starting Balance"
              value={newBalance}
              onChangeText={setNewBalance}
              placeholder="0.00"
              keyboardType="numeric"
            />
            <Button title="Create Wallet" onPress={handleCreateWallet} loading={creating} fullWidth />
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing.md },

  // Header
  header: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  liquidityLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  liquidityAmount: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    letterSpacing: -1,
  },

  // Section
  section: { marginBottom: theme.spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  sectionLink: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },

  // Budget Card
  budgetCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    gap: 8,
  },
  budgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetInfo: { flex: 1 },
  budgetCategory: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  budgetAmounts: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  budgetOf: {
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  budgetRight: { alignItems: 'flex-end' },
  budgetPct: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: theme.colors.danger + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.danger + '40',
  },
  warningText: {
    color: theme.colors.danger,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  budgetBarRow: { marginVertical: 2 },
  budgetAdvice: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
  },

  newCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  newCategoryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },

  // Wallet Row
  walletListCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: 12,
  },
  walletIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: { flex: 1 },
  walletName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletType: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  walletBalanceBox: { alignItems: 'flex-end', gap: 4 },
  walletBalance: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  walletBadge: {
    backgroundColor: theme.colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  walletBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: theme.spacing.md,
  },
  addCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // AI Insight Card
  aiInsightCard: {
    backgroundColor: theme.colors.surfaceMid,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '25',
    gap: 8,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiInsightLabel: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  aiInsightText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  aiInsightBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: 4,
  },
  aiInsightBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: theme.fontSize.sm,
  },

  // Goals
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    gap: 8,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  goalPct: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  goalAmounts: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },

  // Allocation
  allocationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  allocationColDescription: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  allocationColStatus: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight + '50',
  },
  allocationLeft: { flex: 1, marginRight: 8 },
  allocationMerchant: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  allocationMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  allocationAmount: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },

  // Empty
  emptyCard: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  typeLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  typeBtnActive: {
    backgroundColor: theme.colors.primary + '18',
    borderColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  typeTextActive: { color: theme.colors.primary },
});
