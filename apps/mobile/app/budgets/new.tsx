import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useBudgetStore } from '@/stores/budgetStore';
import { useCurrency, formatAmount } from '@/lib/format';
import Input from '@/components/Input';
import Button from '@/components/Button';

const CATEGORIES = [
  'Groceries', 'Dining', 'Transport', 'Health',
  'Shopping', 'Entertainment', 'Utilities', 'Savings',
  'Transfer', 'Other',
];

export default function NewBudgetScreen() {
  const router = useRouter();
  const createBudget = useBudgetStore((s) => s.createBudget);
  const currency = useCurrency();

  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [rollover, setRollover] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const limit = parseFloat(amount);
    if (!amount || isNaN(limit) || limit <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget limit.');
      return;
    }

    setLoading(true);
    try {
      await createBudget({ category, limit, period });
      Alert.alert('Budget Created', `${category} budget set to ${formatAmount(limit, currency)}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create budget. Please try again.');
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
            <Text style={styles.title}>New Budget</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, category === cat && styles.categoryActive]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[styles.categoryText, category === cat && styles.categoryTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Input
            label={`Budget Limit (${currency})`}
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 10000"
            keyboardType="numeric"
          />

          {/* Period */}
          <Text style={styles.label}>Period</Text>
          <View style={styles.periodRow}>
            {(['monthly', 'weekly'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rollover */}
          <View style={styles.rolloverRow}>
            <View>
              <Text style={styles.rolloverLabel}>Rollover unused budget</Text>
              <Text style={styles.rolloverSub}>Carry unspent funds to next period</Text>
            </View>
            <Switch
              value={rollover}
              onValueChange={setRollover}
              trackColor={{ true: theme.colors.primary }}
              thumbColor={rollover ? '#fff' : '#f4f3f4'}
            />
          </View>

          <Button
            title="Create Budget"
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
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: { padding: theme.spacing.md, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  categoryActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  categoryText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: '500' },
  categoryTextActive: { color: theme.colors.primary },
  periodRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  periodActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  periodText: { color: theme.colors.textSecondary, fontWeight: '600', fontSize: theme.fontSize.sm },
  periodTextActive: { color: theme.colors.primary },
  rolloverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
    marginBottom: theme.spacing.lg,
  },
  rolloverLabel: { color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: '500' },
  rolloverSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  submitBtn: { marginTop: theme.spacing.sm },
});
