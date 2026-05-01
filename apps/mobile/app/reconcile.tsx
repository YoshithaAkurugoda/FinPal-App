import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useWalletStore } from '@/stores/walletStore';
import { apiPost } from '@/lib/api';
import { useCurrency, formatAmount } from '@/lib/format';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function ReconcileScreen() {
  const router = useRouter();
  const { wallets, fetchWallets } = useWalletStore();
  const currency = useCurrency();

  const [walletId, setWalletId] = useState('');
  const [statedBalance, setStatedBalance] = useState('');
  const [result, setResult] = useState<{
    computed: number;
    stated: number;
    discrepancy: number;
  } | null>(null);
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets]);

  const selectedWallet = wallets.find((w) => w.id === walletId);

  const handleCompare = () => {
    if (!selectedWallet || !statedBalance) return;
    const stated = Number(statedBalance);
    const computed = selectedWallet.currentBalance;
    setResult({
      computed,
      stated,
      discrepancy: stated - computed,
    });
  };

  const handleAdjust = async () => {
    if (!result || !walletId) return;
    setLoading(true);
    try {
      await apiPost('/reconciliation/submit', {
        walletId,
        statedBalance: result.stated,
        note: adjustmentNote || 'Manual reconciliation',
      });
      Alert.alert('Adjusted', 'Balance has been reconciled', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Reconciliation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Reconcile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Select Wallet</Text>
        <View style={styles.walletRow}>
          {wallets.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.walletChip,
                walletId === w.id && styles.walletActive,
              ]}
              onPress={() => {
                setWalletId(w.id);
                setResult(null);
              }}
            >
              <Text
                style={[
                  styles.walletText,
                  walletId === w.id && styles.walletTextActive,
                ]}
              >
                {w.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Enter your bank balance"
          value={statedBalance}
          onChangeText={setStatedBalance}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Button
          title="Compare"
          onPress={handleCompare}
          fullWidth
          disabled={!statedBalance || !walletId}
          variant="secondary"
        />

        {result && (
          <Card style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Computed (FinPal)</Text>
              <Text style={styles.resultValue}>
                {formatAmount(result.computed, currency)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Stated (Bank)</Text>
              <Text style={styles.resultValue}>
                {formatAmount(result.stated, currency)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Discrepancy</Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color:
                      result.discrepancy === 0
                        ? theme.colors.success
                        : theme.colors.warning,
                  },
                ]}
              >
                {result.discrepancy >= 0 ? '+' : ''}{formatAmount(Math.abs(result.discrepancy), currency)}
              </Text>
            </View>

            {result.discrepancy !== 0 && (
              <>
                <Input
                  label="Adjustment Note"
                  value={adjustmentNote}
                  onChangeText={setAdjustmentNote}
                  placeholder="e.g. Bank fee not recorded"
                />
                <Button
                  title="Apply Adjustment"
                  onPress={handleAdjust}
                  loading={loading}
                  fullWidth
                />
              </>
            )}

            {result.discrepancy === 0 && (
              <Text style={styles.matchText}>Balances match — no action needed!</Text>
            )}
          </Card>
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
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  walletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  walletChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  walletActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  walletText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  walletTextActive: {
    color: theme.colors.primary,
  },
  resultCard: {
    marginTop: theme.spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  resultLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  resultValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceLight,
    marginVertical: theme.spacing.sm,
  },
  matchText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
});
