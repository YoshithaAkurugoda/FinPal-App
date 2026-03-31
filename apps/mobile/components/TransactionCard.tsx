import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import type { Transaction } from '@/stores/transactionStore';

const CATEGORY_COLORS: Record<string, string> = {
  groceries: '#22C55E',
  dining: '#F59E0B',
  transport: '#3B82F6',
  health: '#EF4444',
  shopping: '#EC4899',
  entertainment: '#8B5CF6',
  utilities: '#06B6D4',
  savings: '#10B981',
  transfer: '#6366F1',
  other: '#94A3B8',
};

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const dotColor =
    CATEGORY_COLORS[transaction.category?.toLowerCase()] ?? CATEGORY_COLORS.other;
  const amountColor =
    transaction.type === 'debit' ? theme.colors.danger : theme.colors.success;
  const prefix = transaction.type === 'debit' ? '-' : '+';

  const formattedAmount = `${prefix} ${Number(transaction.amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
  })}`;

  const dateStr = transaction.date
    ? format(new Date(transaction.date), 'MMM d')
    : '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant || 'Unknown'}
        </Text>
        <Text style={styles.meta}>
          {dateStr}
          {transaction.category ? ` · ${transaction.category}` : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>{formattedAmount}</Text>
        {transaction.status === 'pending' && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  merchant: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning + '22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  pendingText: {
    color: theme.colors.warning,
    fontSize: 10,
    fontWeight: '600',
  },
});
