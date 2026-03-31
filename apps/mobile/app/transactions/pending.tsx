import React, { useEffect } from 'react';
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
import Card from '@/components/Card';

export default function PendingScreen() {
  const router = useRouter();
  const {
    pending,
    isLoading,
    fetchPending,
    approveTransaction,
    rejectTransaction,
    batchApprove,
  } = useTransactionStore();

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    if (!isLoading && pending.length === 0) {
      // all done — optionally go back
    }
  }, [pending, isLoading]);

  const handleApproveAll = () => {
    Alert.alert(
      'Approve All',
      `Approve all ${pending.length} transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: () => batchApprove(pending.map((t) => t.id)),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const amountStr = Number(item.amount).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
    });

    return (
      <Card style={styles.txCard}>
        <View style={styles.txHeader}>
          <View style={styles.txInfo}>
            <Text style={styles.txMerchant} numberOfLines={1}>
              {item.merchant || 'Unknown'}
            </Text>
            <Text style={styles.txMeta}>
              {item.category} · {item.source}
              {item.confidence != null && ` · ${Math.round(item.confidence * 100)}% conf.`}
            </Text>
          </View>
          <Text
            style={[
              styles.txAmount,
              {
                color:
                  item.type === 'debit'
                    ? theme.colors.danger
                    : theme.colors.success,
              },
            ]}
          >
            {item.type === 'debit' ? '-' : '+'} {amountStr}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => rejectTransaction(item.id)}
          >
            <Ionicons name="close" size={18} color={theme.colors.danger} />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => approveTransaction(item.id)}
          >
            <Ionicons name="checkmark" size={18} color={theme.colors.success} />
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pending Approvals</Text>
        {pending.length > 0 && (
          <TouchableOpacity onPress={handleApproveAll}>
            <Text style={styles.approveAllText}>Approve All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && pending.length === 0 ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color={theme.colors.success}
              />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>No pending transactions</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  approveAllText: {
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  txCard: {
    marginBottom: theme.spacing.md,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  txInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  txMerchant: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  txMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  txAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.danger + '15',
  },
  rejectText: {
    color: theme.colors.danger,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.success + '15',
  },
  approveText: {
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  loader: {
    marginTop: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
