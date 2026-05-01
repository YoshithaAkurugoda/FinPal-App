import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useWalletStore } from '@/stores/walletStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGoalStore } from '@/stores/goalStore';
import { useAiStore } from '@/stores/aiStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { useCurrency, formatAmount } from '@/lib/format';
import TransactionCard from '@/components/TransactionCard';
import type { Wallet } from '@/stores/walletStore';

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function WalletCard({ wallet, currency }: { wallet: Wallet; currency: string }) {
  const balance = formatAmount(wallet.currentBalance ?? 0, currency);
  const typeLabel = wallet.type === 'bank' ? 'BANK' : wallet.type === 'ewallet' ? 'E-WALLET' : 'CASH';
  const cardGradientColors = ['#1547A8', '#1A3A8F', '#0D2A70'];
  const colorIndex = wallet.name.charCodeAt(0) % 3;

  return (
    <View style={[styles.walletCard, { backgroundColor: cardGradientColors[colorIndex] }]}>
      <View style={styles.walletCardTop}>
        <Text style={styles.walletCardType}>{typeLabel}</Text>
        <Text style={styles.walletCardName} numberOfLines={1}>{wallet.name}</Text>
      </View>
      <Text style={styles.walletCardDots}>* * * *  {wallet.id.slice(-4).toUpperCase()}</Text>
      <View style={styles.walletCardBottom}>
        <View>
          <Text style={styles.walletCardBalanceLabel}>BALANCE</Text>
          <Text style={styles.walletCardBalance}>{balance}</Text>
        </View>
        <View style={styles.walletCardLogoCircles}>
          <View style={[styles.circle, { backgroundColor: '#EF4444', marginRight: -8 }]} />
          <View style={[styles.circle, { backgroundColor: '#F59E0B', opacity: 0.85 }]} />
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { wallets, totalBalance, fetchWallets } = useWalletStore();
  const { fetchBudgets } = useBudgetStore();
  const { fetchGoals } = useGoalStore();
  const { latestCheckin, fetchLatestCheckin } = useAiStore();
  const { transactions, pending, fetchTransactions, fetchPending } = useTransactionStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const [checkinDismissed, setCheckinDismissed] = React.useState(false);

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

  useEffect(() => { loadAll(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const currency = useCurrency();
  const formattedBalance = formatAmount(totalBalance, currency);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.7}
          >
            <Avatar name={user?.name ?? 'U'} />
            <View>
              <Text style={styles.greeting}>Hello, {firstName}</Text>
              <Text style={styles.greetingSub}>Good {getTimeOfDay()}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/transactions/pending')}
            activeOpacity={0.7}
          >
            <View style={styles.bellWrapper}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
              {pending.length > 0 && <View style={styles.bellDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* AI Insight Card */}
        {!checkinDismissed && latestCheckin && (
          <TouchableOpacity
            style={styles.aiInsightCard}
            onPress={() => router.push('/ai/insights')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
            <Text style={styles.aiInsightText} numberOfLines={2}>
              {latestCheckin.content}
            </Text>
            <View style={styles.aiInsightRight}>
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); setCheckinDismissed(true); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={14} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Net Worth */}
        <View style={styles.netWorthSection}>
          <Text style={styles.netWorthLabel}>TOTAL NET WORTH</Text>
          <Text style={styles.netWorthAmount}>{formattedBalance}</Text>
          <View style={styles.netWorthBadge}>
            <Ionicons name="trending-up" size={12} color="#000" />
            <Text style={styles.netWorthBadgeText}>Live balance</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/transactions/new')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => router.push('/reconcile')}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnText, styles.actionBtnOutlineText]}>Reconcile</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Cards */}
        {wallets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Cards</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/wallets')}>
                <Text style={styles.seeAll}>SEE ALL</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={wallets}
              keyExtractor={(w) => w.id}
              renderItem={({ item }) => <WalletCard wallet={item} currency={currency} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletList}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Ionicons name="options-outline" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {transactions.slice(0, 5).length > 0 ? (
            transactions.slice(0, 5).map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))
          ) : (
            <View style={styles.emptyTx}>
              <Ionicons name="receipt-outline" size={36} color={theme.colors.surfaceLight} />
              <Text style={styles.empty}>No transactions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 110 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '30',
    borderWidth: 2,
    borderColor: theme.colors.primary + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  greeting: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  greetingSub: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 1,
  },
  bellWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },

  // AI Insight
  aiInsightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '25',
    gap: 8,
  },
  aiInsightText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
  aiInsightRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Net Worth
  netWorthSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  netWorthLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  netWorthAmount: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxxl,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 10,
  },
  netWorthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  netWorthBadgeText: {
    color: '#000000',
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 13,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  actionBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: theme.fontSize.md,
  },
  actionBtnOutlineText: {
    color: theme.colors.text,
  },

  // Section
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Wallet Cards
  walletList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 4,
  },
  walletCard: {
    width: 220,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    gap: 8,
  },
  walletCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletCardType: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  walletCardName: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    maxWidth: 120,
    textAlign: 'right',
  },
  walletCardDots: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    letterSpacing: 2,
    marginVertical: 6,
  },
  walletCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  walletCardBalanceLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  walletCardBalance: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  walletCardLogoCircles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },

  // Transactions
  emptyTx: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: 8,
  },
  empty: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
});
