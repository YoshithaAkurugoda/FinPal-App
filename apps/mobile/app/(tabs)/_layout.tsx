import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { theme } from '@/constants/theme';

const TAB_CONFIG = [
  { name: 'home',         label: 'HOME',        icon: 'home',         iconOutline: 'home-outline' },
  { name: 'transactions', label: 'ACTIVITY',    icon: 'receipt',      iconOutline: 'receipt-outline' },
  { name: 'ai',           label: 'AI INSIGHTS', icon: 'sparkles',     iconOutline: 'sparkles-outline' },
  { name: 'wallets',      label: 'WALLETS',     icon: 'wallet',       iconOutline: 'wallet-outline' },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((r) =>
    TAB_CONFIG.some((t) => t.name === r.name),
  );

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) + 6 }]}>
      {visibleRoutes.map((route) => {
        const cfg = TAB_CONFIG.find((t) => t.name === route.name)!;
        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === routeIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.tabInner, isFocused && styles.tabInnerActive]}>
              <Ionicons
                name={(isFocused ? cfg.icon : cfg.iconOutline) as any}
                size={20}
                color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {cfg.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="ai" />
      <Tabs.Screen name="wallets" />
      <Tabs.Screen name="add"      options={{ href: null }} />
      <Tabs.Screen name="goals"    options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.xl,
    gap: 3,
    minWidth: 60,
  },
  tabInnerActive: {
    backgroundColor: theme.colors.primary + '18',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
});
