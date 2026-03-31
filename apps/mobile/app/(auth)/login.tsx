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
        >
          <View style={styles.header}>
            <Text style={styles.logo}>FinPal</Text>
            <Text style={styles.subtitle}>Your personal finance companion</Text>
          </View>

          <View style={styles.form}>
            {error && (
              <TouchableOpacity onPress={clearError}>
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </TouchableOpacity>
            )}

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
              placeholder="Enter your password"
              secureTextEntry
            />

            <Button
              title="Log In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                Don't have an account?{' '}
                <Text style={styles.linkAccent}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  form: {
    width: '100%',
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
