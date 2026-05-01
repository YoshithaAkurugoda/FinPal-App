import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { theme } from '@/constants/theme';
import { useCurrency, formatAmount } from '@/lib/format';
import type { Transaction } from '@/stores/transactionStore';

const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  groceries:     { icon: 'cart-outline',               color: '#22C55E' },
  dining:        { icon: 'restaurant-outline',          color: '#F59E0B' },
  transport:     { icon: 'car-outline',                 color: '#3B82F6' },
  health:        { icon: 'medical-outline',             color: '#EF4444' },
  shopping:      { icon: 'bag-outline',                 color: '#EC4899' },
  entertainment: { icon: 'film-outline',                color: '#8B5CF6' },
  utilities:     { icon: 'flash-outline',               color: '#06B6D4' },
  savings:       { icon: 'wallet-outline',              color: '#10B981' },
  transfer:      { icon: 'swap-horizontal-outline',     color: '#6366F1' },
  income:        { icon: 'cash-outline',                color: '#00D4B1' },
  salary:        { icon: 'briefcase-outline',           color: '#00D4B1' },
  electronics:   { icon: 'phone-portrait-outline',      color: '#64748B' },
  other:         { icon: 'ellipsis-horizontal-outline', color: '#94A3B8' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const currency = useCurrency();
  const cat = transaction.category?.toLowerCase() ?? 'other';
  const config = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG.other;

  const isDebit = transaction.type === 'debit';
  const isPending = transaction.status === 'pending';
  const amountColor = isDebit ? theme.colors.text : theme.colors.primary;
  const prefix = isDebit ? '-' : '+';
  const formattedAmount = `${prefix}${formatAmount(Number(transaction.amount), currency)}`;
  const dateStr = transaction.date ? formatDate(transaction.date) : '';

  return (
    <TouchableOpacity
      style={[styles.container, isPending && styles.containerPending]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: config.color + '18' }]}>
        <Ionicons name={config.icon as any} size={20} color={config.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant || 'Unknown'}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{transaction.category || 'Other'}</Text>
          </View>
          <Text style={styles.time}>{dateStr}</Text>
        </View>
        {isPending && (
          <Text style={styles.pendingHint}>Tap to review &amp; approve</Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>{formattedAmount}</Text>
        {isPending ? (
          <View style={styles.badgePendingBox}>
            <Ionicons name="time-outline" size={10} color="#F59E0B" />
            <Text style={styles.badgePendingText}>Pending</Text>
          </View>
        ) : !isDebit ? (
          <View style={[styles.badge, styles.badgeIncome]}>
            <Text style={[styles.badgeText, styles.badgeIncomeText]}>
              {transaction.category === 'salary' ? 'Direct Deposit' : 'Received'}
            </Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.badgeVerified]}>
            <Text style={[styles.badgeText, styles.badgeVerifiedText]}>Verified</Text>
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
    paddingVertical: 13,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    gap: 12,
  },
  containerPending: {
    borderColor: '#F59E0B40',
    backgroundColor: '#F59E0B08',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 5,
  },
  merchant: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChip: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  time: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  right: {
    alignItems: 'flex-end',
    gap: 5,
  },
  amount: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeVerified: {
    borderColor: theme.colors.primary + '60',
    backgroundColor: 'transparent',
  },
  badgeVerifiedText: {
    color: theme.colors.primary,
  },
  pendingHint: {
    color: '#F59E0B',
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  badgePendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderColor: '#F59E0B60',
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgePendingText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeIncome: {
    borderColor: 'transparent',
    backgroundColor: theme.colors.primary + '20',
  },
  badgeIncomeText: {
    color: theme.colors.primary,
  },
});
