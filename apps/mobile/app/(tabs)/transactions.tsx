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
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useTransactionStore, Transaction } from '@/stores/transactionStore';
import TransactionCard from '@/components/TransactionCard';

type Filter = 'all' | 'pending' | 'approved';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
];

export default function TransactionsScreen() {
  const {
    transactions,
    isLoading,
    hasMore,
    fetchTransactions,
  } = useTransactionStore();

  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);

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
      onPress={() => Alert.alert('Transaction', `${item.merchant}\n${item.amount}`)}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>No transactions found</Text>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  filterActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  filterTextActive: {
    color: theme.colors.primary,
  },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 100,
  },
  empty: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
    fontSize: theme.fontSize.sm,
  },
  loader: {
    paddingVertical: theme.spacing.md,
  },
});
