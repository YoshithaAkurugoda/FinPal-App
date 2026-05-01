import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useTransactionStore, Transaction } from '@/stores/transactionStore';
import { useAiStore } from '@/stores/aiStore';
import { useAuthStore } from '@/stores/authStore';
import TransactionCard from '@/components/TransactionCard';

type Filter = 'all' | 'pending' | 'approved';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
];

const ADD_OPTIONS = [
  {
    id: 'manual',
    icon: 'create-outline',
    title: 'Manual Entry',
    subtitle: 'Quickly log cash or offline spends.',
    highlighted: false,
    route: '/transactions/new',
  },
  {
    id: 'pdf',
    icon: 'scan-outline',
    title: 'Scan PDF/Receipt',
    subtitle: 'AI extracts data from photos or files.',
    highlighted: true,
    route: '/ingest/statement',
  },
  {
    id: 'sms',
    icon: 'chatbubble-ellipses-outline',
    title: 'SMS Forwarding',
    subtitle: 'Sync automatically via text alerts.',
    highlighted: false,
    route: '/ingest/sms',
  },
];

export default function ActivityScreen() {
  const router = useRouter();
  const { transactions, isLoading, hasMore, fetchTransactions } = useTransactionStore();
  const { latestCheckin } = useAiStore();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [trendDismissed, setTrendDismissed] = useState(false);

  useEffect(() => {
    setPage(1);
    fetchTransactions({
      status: filter === 'all' ? undefined : filter,
      page: 1,
      limit: 20,
    });
  }, [filter]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions({
      status: filter === 'all' ? undefined : filter,
      page: nextPage,
      limit: 20,
    });
  }, [hasMore, isLoading, page, filter]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => {
        if (item.status === 'pending') {
          router.push('/transactions/pending');
        } else {
          Alert.alert(
            item.merchant || 'Transaction',
            `${item.category} · ${item.status}\n${Number(item.amount).toFixed(2)}`,
          );
        }
      }}
    />
  );

  const ListHeader = (
    <View>
      {/* Add Transaction Section */}
      <View style={styles.addSection}>
        <Text style={styles.intelligenceLabel}>INTELLIGENCE HUB</Text>
        <Text style={styles.addTitle}>Add Transaction</Text>
        {ADD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.optionCard, opt.highlighted && styles.optionCardHighlighted]}
            onPress={() => router.push(opt.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, opt.highlighted && styles.optionIconHighlighted]}>
              <Ionicons
                name={opt.icon as any}
                size={22}
                color={opt.highlighted ? '#000' : theme.colors.text}
              />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, opt.highlighted && styles.optionTitleHighlighted]}>
                {opt.title}
              </Text>
              <Text style={[styles.optionSubtitle, opt.highlighted && styles.optionSubtitleHighlighted]}>
                {opt.subtitle}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={opt.highlighted ? '#00000060' : theme.colors.surfaceLight}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity Header */}
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Recent Activity</Text>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const SmartTrendsCard = !trendDismissed && latestCheckin ? (
    <View style={styles.trendsCard}>
      <View style={styles.trendsHeader}>
        <Text style={styles.trendsTitle}>Smart Trends</Text>
        <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
      </View>
      <Text style={styles.trendsText} numberOfLines={3}>
        {latestCheckin.content}
      </Text>
      <View style={styles.trendsActions}>
        <TouchableOpacity
          style={styles.trendsViewBtn}
          onPress={() => router.push('/ai/insights')}
          activeOpacity={0.8}
        >
          <Text style={styles.trendsViewText}>View Breakdown</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.trendsDismissBtn}
          onPress={() => setTrendDismissed(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.trendsDismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          <>
            {isLoading && (
              <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
            )}
            {SmartTrendsCard}
            <View style={{ height: 110 }} />
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.surfaceLight} />
              <Text style={styles.empty}>No transactions found</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  list: { paddingHorizontal: theme.spacing.md },

  // Add Section
  addSection: {
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  intelligenceLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  addTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    gap: 14,
  },
  optionCardHighlighted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconHighlighted: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  optionInfo: { flex: 1 },
  optionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionTitleHighlighted: { color: '#000000' },
  optionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  optionSubtitleHighlighted: { color: '#00000080' },

  // Recent Activity
  recentHeader: {
    marginBottom: theme.spacing.md,
  },
  recentTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  filterActive: {
    backgroundColor: theme.colors.primary + '18',
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  filterTextActive: { color: theme.colors.primary },

  // Smart Trends Card
  trendsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  trendsTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  trendsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  trendsActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  trendsViewBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  trendsViewText: {
    color: '#000',
    fontWeight: '700',
    fontSize: theme.fontSize.sm,
  },
  trendsDismissBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceMid,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  trendsDismissText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  empty: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  loader: { paddingVertical: theme.spacing.md },
});
