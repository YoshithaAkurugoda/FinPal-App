import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useTransactionStore, Transaction } from '@/stores/transactionStore';
import { useCurrency, formatAmount } from '@/lib/format';
import Card from '@/components/Card';
import Button from '@/components/Button';

const CATEGORIES = [
  'Groceries',
  'Dining',
  'Transport',
  'Health',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Savings',
  'Transfer',
  'Other',
];

interface EditState {
  merchant: string;
  amount: string;
  category: string;
}

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
  const currency = useCurrency();

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editState, setEditState] = useState<EditState>({ merchant: '', amount: '', category: '' });
  // tracks which transaction id is currently being approved or rejected
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApproveAll = () => {
    Alert.alert(
      'Approve All',
      `Approve all ${pending.length} transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: () =>
            batchApprove(pending.map((t) => t.id)).catch(() =>
              Alert.alert('Error', 'Failed to approve transactions. Please try again.'),
            ),
        },
      ],
    );
  };

  const openEdit = (tx: Transaction) => {
    setEditState({
      merchant: tx.merchant ?? '',
      amount: String(tx.amount),
      category: tx.category,
    });
    setEditingTx(tx);
  };

  const handleApproveWithEdits = async () => {
    if (!editingTx) return;

    const parsedAmount = parseFloat(editState.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    setEditSaving(true);
    try {
      await approveTransaction(editingTx.id, {
        merchant: editState.merchant.trim() || editingTx.merchant,
        category: editState.category,
        amount: parsedAmount,
      });
      setEditingTx(null);
    } catch {
      Alert.alert('Error', 'Failed to approve transaction. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleQuickApprove = async (tx: Transaction) => {
    setActioningId(tx.id + ':approve');
    try {
      await approveTransaction(tx.id);
    } catch {
      Alert.alert('Error', 'Failed to approve transaction. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = (tx: Transaction) => {
    Alert.alert(
      'Reject Transaction',
      `Reject ${tx.merchant || 'this transaction'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActioningId(tx.id + ':reject');
            try {
              await rejectTransaction(tx.id);
            } catch {
              Alert.alert('Error', 'Failed to reject transaction. Please try again.');
            } finally {
              setActioningId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const amountStr = formatAmount(Number(item.amount), currency);
    const confidencePct = item.confidence != null ? Math.round(item.confidence * 100) : null;
    const isApproving = actioningId === item.id + ':approve';
    const isRejecting = actioningId === item.id + ':reject';
    const isBusy = isApproving || isRejecting;

    return (
      <Card style={styles.txCard}>
        <View style={styles.txHeader}>
          <View style={styles.txInfo}>
            <Text style={styles.txMerchant} numberOfLines={1}>
              {item.merchant || 'Unknown Merchant'}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              {confidencePct != null && (
                <Text style={[styles.confidence, confidencePct < 70 && styles.confidenceLow]}>
                  {confidencePct}% confidence
                </Text>
              )}
            </View>
            <Text style={styles.txSource}>{item.source} · {new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <Text
            style={[
              styles.txAmount,
              { color: item.type === 'debit' ? theme.colors.danger : theme.colors.success },
            ]}
          >
            {item.type === 'debit' ? '-' : '+'}{amountStr}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.editBtn, isBusy && styles.btnDisabled]}
            onPress={() => openEdit(item)}
            disabled={isBusy}
          >
            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rejectBtn, isBusy && styles.btnDisabled]}
            onPress={() => handleReject(item)}
            disabled={isBusy}
          >
            {isRejecting ? (
              <ActivityIndicator size="small" color={theme.colors.danger} />
            ) : (
              <>
                <Ionicons name="close" size={16} color={theme.colors.danger} />
                <Text style={styles.rejectText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.approveBtn, isBusy && styles.btnDisabled]}
            onPress={() => handleQuickApprove(item)}
            disabled={isBusy}
          >
            {isApproving ? (
              <ActivityIndicator size="small" color={theme.colors.success} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                <Text style={styles.approveText}>Approve</Text>
              </>
            )}
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
              <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.success} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>No pending transactions</Text>
            </View>
          }
        />
      )}

      {/* Edit modal */}
      <Modal
        visible={editingTx !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingTx(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <TouchableOpacity onPress={() => setEditingTx(null)}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Merchant */}
              <Text style={styles.fieldLabel}>Merchant</Text>
              <TextInput
                style={styles.fieldInput}
                value={editState.merchant}
                onChangeText={(v) => setEditState((s) => ({ ...s, merchant: v }))}
                placeholder="Merchant name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              {/* Amount */}
              <Text style={styles.fieldLabel}>Amount ({currency})</Text>
              <TextInput
                style={styles.fieldInput}
                value={editState.amount}
                onChangeText={(v) => setEditState((s) => ({ ...s, amount: v }))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
              />

              {/* Category */}
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      editState.category === cat && styles.catChipActive,
                    ]}
                    onPress={() => setEditState((s) => ({ ...s, category: cat }))}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        editState.category === cat && styles.catChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title={editSaving ? 'Saving...' : 'Approve with Edits'}
                  onPress={handleApproveWithEdits}
                  loading={editSaving}
                  disabled={editSaving}
                  fullWidth
                />
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setEditingTx(null)}
                  disabled={editSaving}
                  fullWidth
                  style={{ marginTop: theme.spacing.sm }}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  categoryBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  confidence: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  confidenceLow: {
    color: theme.colors.warning ?? '#F59E0B',
  },
  txSource: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  txAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary + '15',
  },
  editText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
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
    gap: 5,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.success + '15',
  },
  approveText: {
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  btnDisabled: {
    opacity: 0.5,
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.lg,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  catChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  catChipActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  catChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  catChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalActions: {
    marginTop: theme.spacing.sm,
  },
});
