import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';
import { useAiStore, AiCheckin } from '@/stores/aiStore';
import Card from '@/components/Card';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  daily: { label: 'Daily', color: theme.colors.primary },
  weekly: { label: 'Weekly', color: theme.colors.accent },
  suggestion: { label: 'Suggestion', color: theme.colors.success },
};

export default function InsightsScreen() {
  const router = useRouter();
  const { insights, fetchInsights } = useAiStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: AiCheckin }) => {
    const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.daily;
    return (
      <Card>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: config.color + '20' }]}>
            <Text style={[styles.typeText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.timestamp}>
            {format(new Date(item.createdAt), 'MMM d, HH:mm')}
          </Text>
        </View>
        <Text style={styles.content}>{item.content}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Insights</Text>
        <TouchableOpacity onPress={() => router.push('/ai/chat')}>
          <Ionicons name="chatbubble-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={insights}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="bulb-outline"
              size={64}
              color={theme.colors.surfaceLight}
            />
            <Text style={styles.emptyTitle}>No insights yet</Text>
            <Text style={styles.emptySubtitle}>
              They'll appear as you use the app
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  typeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  content: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
