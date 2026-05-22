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
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import { useGoalStore } from '@/stores/goalStore';
import { useWalletStore } from '@/stores/walletStore';
import { useCurrency, formatAmount } from '@/lib/format';
import SpendingRing from '@/components/SpendingRing';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { goals, contribute } = useGoalStore();
  const { wallets, fetchWallets } = useWalletStore();

  const goal = goals.find((g) => g.id === id);
  const currency = useCurrency();

  const [showContribute, setShowContribute] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [contributing, setContributing] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  const handleContribute = async () => {
    if (!goal || !amount || !selectedWalletId) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setContributing(true);
    try {
      await contribute(goal.id, {
        amount: parsedAmount,
        walletId: selectedWalletId,
      });
      setShowContribute(false);
      setAmount('');
      Alert.alert('Success', 'Contribution recorded!');
    } catch {
      Alert.alert('Error', 'Failed to contribute');
    } finally {
      setContributing(false);
    }
  };

  if (!goal) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Goal</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.notFound}>Goal not found</Text>
      </SafeAreaView>
    );
  }

  const pct = Math.round(goal.progress * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {goal.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ringContainer}>
          <SpendingRing progress={goal.progress} size={160} strokeWidth={14} />
        </View>

        <Card>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>
                {formatAmount(goal.currentAmount, currency)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue}>
                {formatAmount(goal.targetAmount, currency)}
              </Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Deadline</Text>
              <Text style={styles.statValue}>
                {goal.deadline
                  ? format(new Date(goal.deadline), 'MMM d, yyyy')
                  : 'No deadline'}
              </Text>
            </View>
            <View style={styles.stat}>
              <View style={styles.statLabelRow}>
                {goal.projectedDate && (
                  <Ionicons name="sparkles" size={11} color={theme.colors.primary} />
                )}
                <Text style={styles.statLabel}>
                  {goal.projectedDate ? 'AI Projected' : 'Projected'}
                </Text>
              </View>
              <Text style={[styles.statValue, goal.projectedDate && styles.statValueAi]}>
                {goal.projectedDate
                  ? format(new Date(goal.projectedDate), 'MMM yyyy')
                  : '—'}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          title="Contribute"
          onPress={() => setShowContribute(true)}
          fullWidth
          style={{ marginTop: theme.spacing.md }}
        />
      </ScrollView>

      <Modal
        visible={showContribute}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContribute(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contribute to {goal.name}</Text>
            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
            {wallets.length > 0 && (
              <>
                <Text style={styles.walletLabel}>From Wallet</Text>
                <View style={styles.walletList}>
                  {wallets.map((wallet) => (
                    <TouchableOpacity
                      key={wallet.id}
                      style={[
                        styles.walletOption,
                        selectedWalletId === wallet.id && styles.walletOptionSelected,
                      ]}
                      onPress={() => setSelectedWalletId(wallet.id)}
                    >
                      <View style={styles.walletOptionContent}>
                        <Text style={styles.walletOptionName}>{wallet.name}</Text>
                        <Text style={styles.walletOptionBalance}>
                          {formatAmount(wallet.balance, currency)}
                        </Text>
                      </View>
                      {selectedWalletId === wallet.id && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowContribute(false)}
              />
              <Button
                title="Contribute"
                onPress={handleContribute}
                loading={contributing}
              />
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
    flex: 1,
    textAlign: 'center',
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
  ringContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  stat: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  statValueAi: {
    color: theme.colors.primary,
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
  walletLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  walletList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  walletOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  walletOptionContent: {
    flex: 1,
  },
  walletOptionName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletOptionBalance: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
});
