import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { API_URL } from '@/constants';
import { useWalletStore } from '@/stores/walletStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';

type PickedAsset = { uri: string; name: string };

export default function UploadStatementScreen() {
  const router = useRouter();
  const { wallets, fetchWallets } = useWalletStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [walletId, setWalletId] = useState('');
  const [picked, setPicked] = useState<PickedAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const a = result.assets[0];
        setPicked({ uri: a.uri, name: a.name ?? 'statement.pdf' });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!picked || !walletId || !accessToken) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('walletId', walletId);
      form.append('file', {
        uri: picked.uri,
        name: picked.name,
        type: 'application/pdf',
      } as unknown as Blob);

      const res = await fetch(`${API_URL}/ingestion/statement`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { ingestionLogId: string };
        error?: string;
      };
      if (!res.ok || json.success === false) {
        throw new Error(typeof json.error === 'string' ? json.error : 'Upload failed');
      }
      Alert.alert(
        'Queued',
        'Your statement is being processed. Pending transactions will appear shortly.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      Alert.alert('Error', msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Upload Statement</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.instruction}>
          Upload a PDF bank statement to automatically import transactions.
        </Text>

        <TouchableOpacity style={styles.dropzone} onPress={pickFile}>
          <Ionicons
            name="cloud-upload-outline"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.dropzoneText}>
            {picked?.name ?? 'Tap to select PDF'}
          </Text>
        </TouchableOpacity>

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
              >
                {w.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {uploading ? (
          <View style={styles.uploadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.uploadingText}>Processing statement...</Text>
          </View>
        ) : (
          <Button
            title="Upload & Process"
            onPress={handleUpload}
            fullWidth
            disabled={!picked || !walletId}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
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
  dropzone: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    borderStyle: 'dashed',
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  dropzoneText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.md,
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
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  uploadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
});
