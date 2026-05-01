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
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;
    login(email.trim(), password);
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Access your luminescent financial intelligence.</Text>

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
          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com"
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={16} color={theme.colors.textSecondary} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={16} color={theme.colors.textSecondary} />}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.footerLink}>Create an account</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Auth tab toggle */}
          <View style={styles.authTabRow}>
            <View style={[styles.authTab, styles.authTabActive]}>
              <Ionicons name="log-in-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.authTabText, styles.authTabTextActive]}>SIGN IN</Text>
            </View>
            <TouchableOpacity
              style={styles.authTab}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.authTabText}>SIGN UP</Text>
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
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
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
  form: { width: '100%' },
  button: { marginTop: theme.spacing.sm },
  footer: { alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
  footerText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  footerLink: { color: theme.colors.primary, fontWeight: '600' },
  authTabRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  authTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  authTabActive: { backgroundColor: theme.colors.primary + '15' },
  authTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  authTabTextActive: { color: theme.colors.primary },
});
