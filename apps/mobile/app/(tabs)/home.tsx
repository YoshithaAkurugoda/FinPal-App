import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import { useWalletStore } from '@/stores/walletStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGoalStore } from '@/stores/goalStore';
import { useAiStore } from '@/stores/aiStore';
import { useTransactionStore } from '@/stores/transactionStore';
import Card from '@/components/Card';
import SpendingRing from '@/components/SpendingRing';
import ProgressBar from '@/components/ProgressBar';
import TransactionCard from '@/components/TransactionCard';

export default function HomeScreen() {
  const router = useRouter();

  const { totalBalance, fetchWallets, isLoading: walletsLoading } = useWalletStore();
  const { totalBudget, totalSpent, fetchBudgets } = useBudgetStore();
  const { goals, fetchGoals } = useGoalStore();
  const { latestCheckin, fetchLatestCheckin } = useAiStore();
  const {
    transactions,
    pending,
    fetchTransactions,
    fetchPending,
  } = useTransactionStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadAll = useCallback(async () => {
    await Promise.all([
      fetchWallets(),
      fetchBudgets(),
      fetchGoals(),
      fetchLatestCheckin(),
      fetchTransactions({ limit: 5 }),
      fetchPending(),
    ]);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const topGoal = goals.length > 0 ? goals[0] : null;
  const budgetProgress = totalBudget > 0 ? totalSpent / totalBudget : 0;
  const recentTransactions = transactions.slice(0, 5);

  const formattedBalance = totalBalance.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Dashboard</Text>

        {/* Net Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>LKR {formattedBalance}</Text>
        </Card>

        {/* Spending Ring + Top Goal Row */}
        <View style={styles.row}>
          <Card style={styles.ringCard}>
            <SpendingRing progress={budgetProgress} size={100} strokeWidth={8} />
            <Text style={styles.ringLabel}>Monthly Budget</Text>
          </Card>

          <Card
            style={styles.goalCard}
            onPress={topGoal ? () => router.push(`/goals/${topGoal.id}`) : undefined}
          >
            {topGoal ? (
              <>
                <Text style={styles.goalName} numberOfLines={1}>
                  {topGoal.name}
                </Text>
                <ProgressBar progress={topGoal.progress} height={6} />
                <Text style={styles.goalPercent}>
                  {Math.round(topGoal.progress * 100)}%
                </Text>
                {topGoal.projectedDate && (
                  <Text style={styles.goalDate}>
                    Est. {format(new Date(topGoal.projectedDate), 'MMM yyyy')}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.goalName}>No Goals</Text>
                <Text style={styles.goalDate}>Create your first goal</Text>
              </>
            )}
          </Card>
        </View>

        {/* AI Companion Card */}
        <Card
          style={styles.aiCard}
          onPress={() => router.push('/ai/insights')}
        >
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>AI Companion</Text>
            <Text style={styles.aiArrow}>→</Text>
          </View>
          <Text style={styles.aiContent} numberOfLines={3}>
            {latestCheckin?.content ?? 'No insights yet — they will appear as you use the app.'}
          </Text>
        </Card>

        {/* Pending Banner */}
        {pending.length > 0 && (
          <TouchableOpacity
            style={styles.pendingBanner}
            onPress={() => router.push('/transactions/pending')}
            activeOpacity={0.7}
          >
            <Text style={styles.pendingText}>
              {pending.length} transaction{pending.length !== 1 ? 's' : ''} pending
              approval →
            </Text>
          </TouchableOpacity>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))
          ) : (
            <Text style={styles.empty}>No transactions yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  ringCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  ringLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  goalCard: {
    flex: 1,
    justifyContent: 'center',
  },
  goalName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  goalPercent: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 6,
  },
  goalDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: theme.colors.accent + '15',
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  aiTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  aiArrow: {
    fontSize: theme.fontSize.md,
    color: theme.colors.accent,
  },
  aiContent: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  pendingBanner: {
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.warning + '40',
  },
  pendingText: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginTop: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  empty: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
});
