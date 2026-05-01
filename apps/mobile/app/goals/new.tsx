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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useGoalStore } from '@/stores/goalStore';
import { useCurrency, formatAmount } from '@/lib/format';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function NewGoalScreen() {
  const router = useRouter();
  const createGoal = useGoalStore((s) => s.createGoal);
  const currency = useCurrency();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute required monthly savings if deadline given
  const monthlySavingsNeeded = (() => {
    const target = parseFloat(targetAmount);
    if (!targetDate || isNaN(target) || target <= 0) return null;
    const deadline = new Date(targetDate);
    const now = new Date();
    const months =
      (deadline.getFullYear() - now.getFullYear()) * 12 +
      (deadline.getMonth() - now.getMonth());
    if (months <= 0) return null;
    return Math.ceil(target / months);
  })();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a goal name.');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount.');
      return;
    }
    if (targetDate) {
      const d = new Date(targetDate);
      if (isNaN(d.getTime()) || d <= new Date()) {
        Alert.alert('Invalid Date', 'Target date must be in the future.');
        return;
      }
    }

    setLoading(true);
    try {
      await createGoal({
        name: name.trim(),
        targetAmount: target,
        deadline: targetDate || undefined,
      });
      Alert.alert('Goal Created', `"${name.trim()}" goal created!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
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
            <Text style={styles.title}>New Goal</Text>
            <View style={{ width: 28 }} />
          </View>

          <Input
            label="Goal Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Emergency Fund"
          />

          <Input
            label={`Target Amount (${currency})`}
            value={targetAmount}
            onChangeText={setTargetAmount}
            placeholder="e.g. 100000"
            keyboardType="numeric"
          />

          <Input
            label="Target Date (optional, YYYY-MM-DD)"
            value={targetDate}
            onChangeText={setTargetDate}
            placeholder="e.g. 2027-01-01"
          />

          {monthlySavingsNeeded !== null && (
            <View style={styles.hint}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.hintText}>
                You need to save {formatAmount(monthlySavingsNeeded, currency)} / month to reach
                this goal by your deadline.
              </Text>
            </View>
          )}

          <Button
            title="Create Goal"
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
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    lineHeight: 18,
  },
  submitBtn: { marginTop: theme.spacing.sm },
});
