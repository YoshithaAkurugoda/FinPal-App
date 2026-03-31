import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import { useGoalStore, GoalWithProjection } from '@/stores/goalStore';
import { useWalletStore } from '@/stores/walletStore';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, isLoading, fetchGoals, contribute } = useGoalStore();
  const { wallets, fetchWallets } = useWalletStore();

  const [showContribute, setShowContribute] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithProjection | null>(null);
  const [amount, setAmount] = useState('');
  const [contributing, setContributing] = useState(false);

  useEffect(() => {
    fetchGoals();
    fetchWallets();
  }, []);

  const handleContribute = async () => {
    if (!selectedGoal || !amount || !wallets[0]) return;
    setContributing(true);
    try {
      await contribute(selectedGoal.id, {
        amount: Number(amount),
        walletId: wallets[0].id,
      });
      setShowContribute(false);
      setAmount('');
      Alert.alert('Success', 'Contribution added!');
    } catch {
      Alert.alert('Error', 'Failed to contribute');
    } finally {
      setContributing(false);
    }
  };

  const openContribute = (goal: GoalWithProjection) => {
    setSelectedGoal(goal);
    setAmount('');
    setShowContribute(true);
  };

  const renderGoal = ({ item }: { item: GoalWithProjection }) => {
    const pct = Math.round(item.progress * 100);
    const current = item.currentAmount.toLocaleString('en-LK');
    const target = item.targetAmount.toLocaleString('en-LK');

    return (
      <Card
        onPress={() => router.push(`/goals/${item.id}`)}
        style={styles.goalCard}
      >
        <View style={styles.goalHeader}>
          <Text style={styles.goalName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.goalPct}>{pct}%</Text>
        </View>
        <ProgressBar progress={item.progress} height={6} />
        <View style={styles.goalFooter}>
          <Text style={styles.goalAmounts}>
            {current} / {target}
          </Text>
          <Text style={styles.goalDate}>
            {item.deadline
              ? format(new Date(item.deadline), 'MMM yyyy')
              : 'No deadline'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.contributeBtn}
          onPress={() => openContribute(item)}
        >
          <Text style={styles.contributeBtnText}>Contribute</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/goals/[id]' as any)}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading && goals.length === 0 ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderGoal}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No goals yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap + to create your first savings goal
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={showContribute}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContribute(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Contribute to {selectedGoal?.name}
            </Text>
            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  goalCard: {
    marginBottom: theme.spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  goalName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  goalPct: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  goalAmounts: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  goalDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  contributeBtn: {
    marginTop: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
  },
  contributeBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  loader: {
    marginTop: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
