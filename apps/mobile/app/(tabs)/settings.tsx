import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { apiPut } from '@/lib/api';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthStore();
  const [monthlyIncome, setMonthlyIncome] = useState(
    user?.monthlyIncome?.toString() ?? '',
  );
  const [notifications, setNotifications] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveIncome = async () => {
    if (!monthlyIncome) return;
    setSaving(true);
    try {
      await updateProfile({ monthlyIncome: Number(monthlyIncome) } as any);
      Alert.alert('Saved', 'Monthly income updated');
    } catch {
      Alert.alert('Error', 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      if (!Device.isDevice) {
        Alert.alert('Not Available', 'Push notifications require a physical device.');
        return;
      }
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Enable notifications in your device settings.');
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      try {
        await apiPut('/users/fcm-token', { fcmToken: tokenData.data });
        setNotifications(true);
      } catch {
        Alert.alert('Error', 'Failed to register for notifications.');
      }
    } else {
      try {
        await apiPut('/users/fcm-token', { fcmToken: '' });
        setNotifications(false);
      } catch {
        Alert.alert('Error', 'Failed to update notification settings.');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile Section */}
        <Card>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email ?? '—'}</Text>
          </View>
          <Input
            label="Monthly Income"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            placeholder="e.g. 150000"
            keyboardType="numeric"
          />
          <Button
            title="Save Income"
            onPress={handleSaveIncome}
            variant="secondary"
            loading={saving}
            fullWidth
          />
        </Card>

        {/* Ingestion Section */}
        <Card>
          <Text style={styles.sectionTitle}>Add Transactions</Text>
          <SettingsRow
            icon="chatbubble-ellipses-outline"
            label="Paste SMS"
            subtitle="Parse bank SMS notifications"
            onPress={() => router.push('/ingest/sms')}
          />
          <SettingsRow
            icon="document-outline"
            label="Upload Statement"
            subtitle="Import bank PDF statements"
            onPress={() => router.push('/ingest/statement')}
          />
        </Card>

        {/* More Section */}
        <Card>
          <Text style={styles.sectionTitle}>More</Text>
          <SettingsRow
            icon="wallet-outline"
            label="Wallets"
            onPress={() => router.push('/(tabs)/wallets')}
          />
          <SettingsRow
            icon="bar-chart-outline"
            label="Budgets"
            onPress={() => router.push('/budgets')}
          />
          <SettingsRow
            icon="analytics-outline"
            label="Reports"
            onPress={() => router.push('/reports')}
          />
          <SettingsRow
            icon="git-compare-outline"
            label="Reconcile"
            onPress={() => router.push('/reconcile')}
          />
          <SettingsRow
            icon="chatbox-outline"
            label="AI Chat"
            onPress={() => router.push('/ai/chat')}
          />
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.rowLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{
                false: theme.colors.surfaceLight,
                true: theme.colors.primary + '60',
              }}
              thumbColor={notifications ? theme.colors.primary : '#888'}
            />
          </View>
        </Card>

        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <Ionicons
        name={icon as any}
        size={20}
        color={theme.colors.textSecondary}
      />
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.surfaceLight}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight + '40',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  rowSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutBtn: {
    marginTop: theme.spacing.md,
  },
});
