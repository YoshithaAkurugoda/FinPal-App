import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useWalletStore, Wallet, WalletType } from '@/stores/walletStore';
import { useCurrency, formatAmount } from '@/lib/format';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

const TYPE_ICONS: Record<WalletType, string> = {
  bank: 'business-outline',
  cash: 'cash-outline',
  ewallet: 'phone-portrait-outline',
};

export default function WalletsScreen() {
  const router = useRouter();
  const { wallets, totalBalance, isLoading, fetchWallets, createWallet } = useWalletStore();
  const currency = useCurrency();

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<WalletType>('bank');
  const [newBalance, setNewBalance] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert('Missing Name', 'Please enter a wallet name.');
      return;
    }
    const starting = parseFloat(newBalance) || 0;
    setCreating(true);
    try {
      await createWallet({ name: newName.trim(), type: newType, startingBalance: starting });
      setShowNew(false);
      setNewName('');
      setNewBalance('');
      setNewType('bank');
    } catch {
      Alert.alert('Error', 'Failed to create wallet.');
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }: { item: Wallet }) => (
    <Card onPress={() => router.push(`/wallets/${item.id}` as any)} style={styles.walletCard}>
      <View style={styles.walletRow}>
        <View style={styles.walletIcon}>
          <Ionicons
            name={TYPE_ICONS[item.type] as any}
            size={22}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.walletInfo}>
          <Text style={styles.walletName}>{item.name}</Text>
          <Text style={styles.walletType}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={styles.balanceRight}>
          <Text style={styles.balance}>
            {formatAmount(item.currentBalance ?? 0, currency)}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Wallets</Text>
        <TouchableOpacity onPress={() => setShowNew(true)}>
          <Ionicons name="add-circle-outline" size={26} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={styles.totalAmount}>
          {formatAmount(totalBalance, currency)}
        </Text>
      </View>

      {isLoading && wallets.length === 0 ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No wallets yet</Text>
              <Text style={styles.emptySub}>Tap + to add your first wallet</Text>
            </View>
          }
        />
      )}

      {/* Create Wallet Modal */}
      <Modal visible={showNew} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalCard}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Wallet</Text>
                <TouchableOpacity onPress={() => setShowNew(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <Input
                label="Wallet Name"
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Sampath Bank"
              />

              <Text style={styles.label}>Type</Text>
              <View style={styles.typeRow}>
                {(['bank', 'cash', 'ewallet'] as WalletType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, newType === t && styles.typeBtnActive]}
                    onPress={() => setNewType(t)}
                  >
                    <Ionicons
                      name={TYPE_ICONS[t] as any}
                      size={18}
                      color={newType === t ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text
                      style={[styles.typeText, newType === t && styles.typeTextActive]}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label={`Starting Balance (${currency})`}
                value={newBalance}
                onChangeText={setNewBalance}
                placeholder="0.00"
                keyboardType="numeric"
              />

              <Button
                title="Create Wallet"
                onPress={handleCreate}
                loading={creating}
                fullWidth
                style={styles.createBtn}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
  totalCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: theme.fontSize.sm, marginBottom: 4 },
  totalAmount: { color: '#fff', fontSize: 28, fontWeight: '800' },
  list: { padding: theme.spacing.md, paddingBottom: 40 },
  walletCard: { marginBottom: theme.spacing.sm },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  walletIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: { flex: 1 },
  walletName: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  walletType: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  balanceRight: { alignItems: 'flex-end' },
  balance: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.text },
  loader: { marginTop: 60 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
  emptySub: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.lg,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  typeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  typeBtnActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  typeText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '500' },
  typeTextActive: { color: theme.colors.primary },
  createBtn: { marginTop: theme.spacing.sm },
});
