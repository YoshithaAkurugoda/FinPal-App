import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service to continue.');
      return;
    }
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
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="analytics" size={32} color={theme.colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Join FinPal</Text>
          <Text style={styles.subtitle}>
            Start your journey toward luminescent financial intelligence today. Secure, proactive, and built for your future.
          </Text>

          {/* Error */}
          {error && (
            <TouchableOpacity onPress={clearError}>
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Form */}
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Cameron Williamson"
            leftIcon={<Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="cameron@example.com"
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={16} color={theme.colors.textSecondary} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={16} color={theme.colors.textSecondary} />}
          />

          <Input
            label="Monthly Income (optional)"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            placeholder="e.g. 5000"
            keyboardType="numeric"
            leftIcon={<Ionicons name="cash-outline" size={16} color={theme.colors.textSecondary} />}
          />

          <Text style={styles.sectionLabel}>Currency</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.currencyChip, currency === c && styles.currencyActive]}
                onPress={() => setCurrency(c)}
              >
                <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
              {agreedToTerms && <Ionicons name="checkmark" size={12} color="#000" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.footerLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: theme.spacing.lg },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.danger + '30',
  },
  errorText: { color: theme.colors.danger, fontSize: theme.fontSize.sm, flex: 1 },
  sectionLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
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
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  currencyActive: {
    backgroundColor: theme.colors.primary + '18',
    borderColor: theme.colors.primary,
  },
  currencyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  currencyTextActive: { color: theme.colors.primary },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.lg,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  termsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: { color: theme.colors.primary, fontWeight: '600' },
  button: { marginTop: 4 },
  footer: { alignItems: 'center', marginTop: theme.spacing.lg },
  footerText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  footerLink: { color: theme.colors.primary, fontWeight: '600' },
});
