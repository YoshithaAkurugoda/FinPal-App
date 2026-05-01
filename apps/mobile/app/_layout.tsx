import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { startQueueListener } from '@/lib/offlineQueue';
import { registerPushTokenWithServer } from '@/lib/pushNotifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initialize().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    const unsubscribe = startQueueListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void registerPushTokenWithServer();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      const type = data?.type;
      if (type === 'pending_transaction') {
        router.push('/transactions/pending');
      } else if (type === 'budget_warning') {
        router.push('/budgets');
      } else if (type === 'ingestion_failed') {
        router.push('/ingest/sms');
      } else if (type === 'goal_milestone') {
        const goalId = data?.goalId;
        if (goalId) {
          router.push(`/goals/${goalId}` as any);
        } else {
          router.push('/(tabs)/wallets');
        }
      } else if (
        type === 'ai_daily' ||
        type === 'ai_weekly' ||
        type === 'unusual_transaction' ||
        type === 'new_merchant' ||
        type === 'surplus_suggestion'
      ) {
        router.push('/ai/insights');
      }
    });
    return () => sub.remove();
  }, [router]);

  if (isLoading) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="transactions/new"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="transactions/pending" />
        <Stack.Screen name="ingest/sms" />
        <Stack.Screen name="ingest/statement" />
        <Stack.Screen name="ai/chat" />
        <Stack.Screen name="ai/insights" />
        <Stack.Screen name="budgets/index" />
        <Stack.Screen name="budgets/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="budgets/[id]" />
        <Stack.Screen name="goals/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="goals/[id]" />
        <Stack.Screen name="wallets/index" />
        <Stack.Screen name="wallets/[id]" />
        <Stack.Screen name="reconcile" />
        <Stack.Screen name="reports" />
      </Stack>
    </>
  );
}
