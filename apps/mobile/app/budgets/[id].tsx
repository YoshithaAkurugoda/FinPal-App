import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useBudgetStore } from '@/stores/budgetStore';
import { useTransactionStore } from '@/stores/transactionStore';
import ProgressBar from '@/components/ProgressBar';
import TransactionCard from '@/components/TransactionCard';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function BudgetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { budgets, updateBudget } = useBudgetStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  const budget = budgets.find((b) => b.id === id);

  const [showEdit, setShowEdit] = useState(false);
  const [newLimit, setNewLimit] = useState(budget?.limit.toString() ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (budget) {
      fetchTransactions({ category: budget.category, limit: 50 });
    }
  }, [budget?.category]);

  const handleSave = async () => {
    if (!id || !newLimit) return;
    setSaving(true);
    try {
      await updateBudget(id, { limit: Number(newLimit) });
      setShowEdit(false);
      Alert.alert('Saved', 'Budget updated');
    } catch {
      Alert.alert('Error', 'Failed to update budget');
    } finally {
      setSaving(false);
    }
  };

  if (!budget) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Budget</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.notFound}>Budget not found</Text>
      </SafeAreaView>
    );
  }

  const categoryTransactions = transactions.filter(
    (t) => t.category?.toLowerCase() === budget.category.toLowerCase(),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{budget.category}</Text>
        <TouchableOpacity onPress={() => setShowEdit(true)}>
          <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.summaryValue}>
              {budget.spent.toLocaleString('en-LK')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Limit</Text>
            <Text style={styles.summaryValue}>
              {budget.limit.toLocaleString('en-LK')}
            </Text>
          </View>
          <ProgressBar progress={budget.progress} height={8} />
          <Text style={styles.remaining}>
            {budget.remaining >= 0
              ? `${budget.remaining.toLocaleString('en-LK')} remaining`
              : `${Math.abs(budget.remaining).toLocaleString('en-LK')} over budget`}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Transactions</Text>
        {categoryTransactions.length > 0 ? (
          categoryTransactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        ) : (
          <Text style={styles.emptyText}>No transactions in this category</Text>
        )}
      </ScrollView>

      <Modal
        visible={showEdit}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEdit(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Budget</Text>
            <Input
              label="Monthly Limit"
              value={newLimit}
              onChangeText={setNewLimit}
              keyboardType="numeric"
              placeholder="Budget limit"
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowEdit(false)} />
              <Button title="Save" onPress={handleSave} loading={saving} />
            </View>
          </View>
        </View>
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
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  notFound: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 60,
    fontSize: theme.fontSize.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  remaining: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
    fontSize: theme.fontSize.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
});
