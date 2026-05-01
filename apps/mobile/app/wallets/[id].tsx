import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useWalletStore, WalletType } from '@/stores/walletStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCurrency, formatAmount } from '@/lib/format';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

const TYPE_ICONS: Record<WalletType, string> = {
  bank: 'business-outline',
  cash: 'cash-outline',
  ewallet: 'phone-portrait-outline',
};

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { wallets, fetchWallets, updateWallet, deleteWallet } = useWalletStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  const wallet = wallets.find((w) => w.id === id);
  const currency = useCurrency();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<WalletType>('bank');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWallets();
    if (id) fetchTransactions({ walletId: id, status: 'approved' });
  }, [id]);

  useEffect(() => {
    if (wallet) {
      setEditName(wallet.name);
      setEditType(wallet.type);
    }
  }, [wallet]);

  const walletTxs = transactions.filter((t) => t.walletId === id).slice(0, 20);

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Invalid', 'Wallet name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateWallet(id!, { name: editName.trim(), type: editType });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update wallet.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Wallet',
      `This will permanently delete "${wallet?.name}" and all its transaction history. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet(id!);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete wallet.');
            }
          },
        },
      ],
    );
  };

  if (!wallet) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {wallet.name}
        </Text>
        <TouchableOpacity onPress={() => setEditing((e) => !e)}>
          <Ionicons
            name={editing ? 'close-outline' : 'pencil-outline'}
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Ionicons
            name={TYPE_ICONS[wallet.type] as any}
            size={28}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.walletType}>{wallet.type.toUpperCase()}</Text>
          <Text style={styles.balance}>
            {formatAmount(wallet.currentBalance ?? 0, currency)}
          </Text>
          <Text style={styles.balanceLabel}>Current Balance</Text>
        </View>

        {/* Edit Section */}
        {editing && (
          <Card style={styles.editCard}>
            <Text style={styles.sectionTitle}>Edit Wallet</Text>
            <Input
              label="Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="Wallet name"
            />
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {(['bank', 'cash', 'ewallet'] as WalletType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, editType === t && styles.typeBtnActive]}
                  onPress={() => setEditType(t)}
                >
                  <Text style={[styles.typeText, editType === t && styles.typeTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              fullWidth
              style={{ marginBottom: theme.spacing.sm }}
            />
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
              <Text style={styles.deleteBtnText}>Delete Wallet</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {walletTxs.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          walletTxs.map((tx) => (
            <Card key={tx.id} style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txMerchant}>{tx.merchant ?? 'Unknown'}</Text>
                  <Text style={styles.txMeta}>
                    {tx.category} · {new Date(tx.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    tx.type === 'credit' ? styles.txCredit : styles.txDebit,
                  ]}
                >
                  {tx.type === 'credit' ? '+' : '-'}{formatAmount(Number(tx.amount), currency)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  loader: { marginTop: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm,
  },
  content: { padding: theme.spacing.md, paddingBottom: 40 },
  balanceCard: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: 6,
  },
  walletType: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  balance: { color: '#fff', fontSize: 30, fontWeight: '800' },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: theme.fontSize.xs },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  editCard: { marginBottom: theme.spacing.lg },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  typeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  typeBtnActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  typeText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: '500' },
  typeTextActive: { color: theme.colors.primary },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
  },
  deleteBtnText: { color: theme.colors.danger, fontSize: theme.fontSize.sm, fontWeight: '500' },
  txCard: { marginBottom: 8 },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text },
  txMeta: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  txAmount: { fontSize: theme.fontSize.sm, fontWeight: '700' },
  txCredit: { color: theme.colors.success },
  txDebit: { color: theme.colors.danger },
  emptyText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, textAlign: 'center', paddingVertical: 30 },
});
