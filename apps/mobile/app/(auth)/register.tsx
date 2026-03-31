import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';

const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'INR'];

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [currency, setCurrency] = useState('LKR');

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    register({
      name: name.trim(),
      email: email.trim(),
      password,
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
      currency,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start managing your finances</Text>

          {error && (
            <TouchableOpacity onPress={clearError}>
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </TouchableOpacity>
          )}

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
          />

          <Input
            label="Monthly Income (optional)"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            placeholder="e.g. 150000"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.currencyChip,
                  currency === c && styles.currencyActive,
                ]}
                onPress={() => setCurrency(c)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    currency === c && styles.currencyTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.link}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkAccent}>Log In</Text>
            </Text>
          </TouchableOpacity>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  errorBanner: {
    backgroundColor: theme.colors.danger + '20',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  currencyChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  currencyActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  currencyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  currencyTextActive: {
    color: theme.colors.primary,
  },
  button: {
    marginTop: theme.spacing.sm,
  },
  link: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  linkAccent: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
