import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { useWalletStore } from '@/stores/walletStore';
import api from '@/lib/api';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function PasteSmsScreen() {
  const router = useRouter();
  const { wallets, fetchWallets } = useWalletStore();

  const [rawText, setRawText] = useState('');
  const [walletId, setWalletId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handlePasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setRawText(text);
    } else {
      Alert.alert('Empty Clipboard', 'No text found in clipboard');
    }
  };

  const handleSubmit = async () => {
    if (!rawText.trim()) {
      Alert.alert('Empty', 'Please paste or type the SMS text');
      return;
    }
    if (!walletId) {
      Alert.alert('No Wallet', 'Please select a wallet');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ingestion/sms', {
        rawText: rawText.trim(),
        walletId,
      });
      setSuccess(true);
    } catch (err: any) {
      Alert.alert(
        'Parse Failed',
        err.response?.data?.message ?? 'Could not parse the SMS. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle"
            size={80}
            color={theme.colors.success}
          />
          <Text style={styles.successTitle}>Transaction Parsed!</Text>
          <Text style={styles.successSubtitle}>
            Check your pending approvals to review and confirm.
          </Text>
          <Button
            title="View Pending"
            onPress={() => {
              setSuccess(false);
              setRawText('');
              router.push('/transactions/pending');
            }}
            fullWidth
            style={{ marginTop: theme.spacing.lg }}
          />
          <Button
            title="Paste Another"
            variant="secondary"
            onPress={() => {
              setSuccess(false);
              setRawText('');
            }}
            fullWidth
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      </SafeAreaView>
    );
  }

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
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Paste SMS</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.instruction}>
            Copy your bank SMS notification and paste it below. We'll automatically
            extract the transaction details.
          </Text>

          <Input
            label="SMS Text"
            value={rawText}
            onChangeText={setRawText}
            placeholder="Paste your bank SMS here..."
            multiline
            numberOfLines={6}
          />

          <Button
            title="Paste from Clipboard"
            variant="secondary"
            onPress={handlePasteFromClipboard}
            fullWidth
            style={styles.pasteBtn}
          />

          <Text style={styles.walletLabel}>Select Wallet</Text>
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
            title="Parse Transaction"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            disabled={!rawText.trim()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  instruction: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  pasteBtn: {
    marginBottom: theme.spacing.lg,
  },
  walletLabel: {
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
  submitBtn: {
    marginTop: theme.spacing.sm,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  successSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
});
