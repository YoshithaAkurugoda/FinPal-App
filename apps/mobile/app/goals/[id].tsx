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

  const [showContribute, setShowContribute] = useState(false);
  const [amount, setAmount] = useState('');
  const [contributing, setContributing] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleContribute = async () => {
    if (!goal || !amount || !wallets[0]) return;
    setContributing(true);
    try {
      await contribute(goal.id, {
        amount: Number(amount),
        walletId: wallets[0].id,
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
                {goal.currentAmount.toLocaleString('en-LK')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue}>
                {goal.targetAmount.toLocaleString('en-LK')}
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
              <Text style={styles.statLabel}>Projected</Text>
              <Text style={styles.statValue}>
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
              <Text style={styles.walletNote}>
                From: {wallets[0].name}
              </Text>
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
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
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
  walletNote: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
});
