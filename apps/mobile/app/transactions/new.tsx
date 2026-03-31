import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore } from '@/stores/walletStore';
import Input from '@/components/Input';
import Button from '@/components/Button';

const CATEGORIES = [
  { name: 'Groceries', icon: 'cart-outline' },
  { name: 'Dining', icon: 'restaurant-outline' },
  { name: 'Transport', icon: 'car-outline' },
  { name: 'Health', icon: 'medkit-outline' },
  { name: 'Shopping', icon: 'bag-outline' },
  { name: 'Entertainment', icon: 'game-controller-outline' },
  { name: 'Utilities', icon: 'flash-outline' },
  { name: 'Savings', icon: 'wallet-outline' },
  { name: 'Transfer', icon: 'swap-horizontal-outline' },
  { name: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function NewTransactionScreen() {
  const router = useRouter();
  const addManual = useTransactionStore((s) => s.addManual);
  const { wallets, fetchWallets } = useWalletStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Other');
  const [walletId, setWalletId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handleSubmit = async () => {
    if (!amount || !merchant.trim() || !walletId) {
      Alert.alert('Missing Fields', 'Please fill in amount, merchant, and select a wallet.');
      return;
    }
    setLoading(true);
    try {
      await addManual({
        walletId,
        type,
        amount: Number(amount),
        merchant: merchant.trim(),
        category,
        date: new Date().toISOString(),
      });
      Alert.alert('Success', 'Transaction added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Add Transaction</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>LKR</Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          {/* Type Toggle */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'debit' && styles.typeBtnActive]}
              onPress={() => setType('debit')}
            >
              <Text
                style={[
                  styles.typeText,
                  type === 'debit' && styles.typeTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'credit' && styles.typeBtnActiveGreen,
              ]}
              onPress={() => setType('credit')}
            >
              <Text
                style={[
                  styles.typeText,
                  type === 'credit' && styles.typeTextActiveGreen,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Merchant / Payee"
            value={merchant}
            onChangeText={setMerchant}
            placeholder="e.g. Keells Super"
          />

          {/* Category Grid */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryBtn,
                  category === cat.name && styles.categoryActive,
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={
                    category === cat.name
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.name && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wallet Selector */}
          <Text style={styles.label}>Wallet</Text>
          <View style={styles.walletRow}>
            {wallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.walletChip,
                  walletId === w.id && styles.walletActive,
                ]}
                onPress={() => setWalletId(w.id)}
              >
                <Text
                  style={[
                    styles.walletText,
                    walletId === w.id && styles.walletTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {w.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Add Transaction"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: { flex: 1 },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  amountContainer: {
    marginBottom: theme.spacing.md,
  },
  currency: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: 4,
    fontWeight: '500',
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  typeBtnActive: {
    backgroundColor: theme.colors.danger + '15',
    borderColor: theme.colors.danger,
  },
  typeBtnActiveGreen: {
    backgroundColor: theme.colors.success + '15',
    borderColor: theme.colors.success,
  },
  typeText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  typeTextActive: {
    color: theme.colors.danger,
  },
  typeTextActiveGreen: {
    color: theme.colors.success,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  categoryBtn: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    flexGrow: 1,
  },
  categoryActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: theme.colors.primary,
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
  submitBtn: {
    marginTop: theme.spacing.sm,
  },
});
