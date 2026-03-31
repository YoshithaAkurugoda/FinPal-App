import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { useGoalStore } from '@/stores/goalStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import type { Wallet } from '@/stores/walletStore';

const WALLET_TYPES: { label: string; value: Wallet['type'] }[] = [
  { label: 'Bank Account', value: 'bank' },
  { label: 'Cash', value: 'cash' },
  { label: 'E-Wallet', value: 'ewallet' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createWallet = useWalletStore((s) => s.createWallet);
  const createGoal = useGoalStore((s) => s.createGoal);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [walletName, setWalletName] = useState('My Bank Account');
  const [walletType, setWalletType] = useState<Wallet['type']>('bank');
  const [startingBalance, setStartingBalance] = useState('');

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleWalletCreate = async () => {
    if (!walletName.trim()) return;
    setLoading(true);
    try {
      await createWallet({
        name: walletName.trim(),
        type: walletType,
        startingBalance: startingBalance ? Number(startingBalance) : 0,
      });
      setStep(1);
    } catch {
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreate = async () => {
    if (goalName.trim() && targetAmount) {
      setLoading(true);
      try {
        await createGoal({
          name: goalName.trim(),
          targetAmount: Number(targetAmount),
          deadline: deadline || undefined,
        });
      } catch {
        // goal is optional — continue anyway
      } finally {
        setLoading(false);
      }
    }
    setStep(2);
  };

  const handleFinish = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, step >= i && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <View>
            <Text style={styles.title}>
              Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </Text>
            <Text style={styles.subtitle}>Let's set up your first wallet</Text>

            <Input
              label="Wallet Name"
              value={walletName}
              onChangeText={setWalletName}
              placeholder="e.g. Sampath Savings"
            />

            <Text style={styles.label}>Wallet Type</Text>
            <View style={styles.typeRow}>
              {WALLET_TYPES.map((wt) => (
                <TouchableOpacity
                  key={wt.value}
                  style={[
                    styles.typeChip,
                    walletType === wt.value && styles.typeActive,
                  ]}
                  onPress={() => setWalletType(wt.value)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      walletType === wt.value && styles.typeTextActive,
                    ]}
                  >
                    {wt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Starting Balance"
              value={startingBalance}
              onChangeText={setStartingBalance}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Button
              title="Continue"
              onPress={handleWalletCreate}
              loading={loading}
              fullWidth
            />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.title}>Set a Savings Goal</Text>
            <Text style={styles.subtitle}>Optional — you can skip this</Text>

            <Input
              label="Goal Name"
              value={goalName}
              onChangeText={setGoalName}
              placeholder="e.g. Emergency Fund"
            />

            <Input
              label="Target Amount"
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="e.g. 500000"
              keyboardType="numeric"
            />

            <Input
              label="Deadline (YYYY-MM-DD, optional)"
              value={deadline}
              onChangeText={setDeadline}
              placeholder="e.g. 2026-12-31"
            />

            <Button
              title={goalName.trim() ? 'Create Goal & Continue' : 'Skip'}
              onPress={handleGoalCreate}
              loading={loading}
              fullWidth
              variant={goalName.trim() ? 'primary' : 'secondary'}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.finishContainer}>
            <Text style={styles.title}>You're All Set!</Text>
            <Text style={styles.subtitle}>Here's how to add transactions:</Text>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Manual Entry</Text>
              <Text style={styles.tipBody}>
                Tap the + button to quickly log any expense or income.
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Paste SMS</Text>
              <Text style={styles.tipBody}>
                Copy a bank notification SMS and paste it in Settings → Paste SMS.
                We'll automatically extract the transaction details.
              </Text>
            </View>

            <Button
              title="Get Started"
              onPress={handleFinish}
              fullWidth
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
  },
  typeActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  typeTextActive: {
    color: theme.colors.primary,
  },
  finishContainer: {
    flex: 1,
  },
  tipCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tipTitle: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});
