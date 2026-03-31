import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useBudgetStore, BudgetWithStatus } from '@/stores/budgetStore';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';

export default function BudgetsScreen() {
  const router = useRouter();
  const { budgets, isLoading, fetchBudgets } = useBudgetStore();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const renderItem = ({ item }: { item: BudgetWithStatus }) => {
    const spent = item.spent.toLocaleString('en-LK');
    const limit = item.limit.toLocaleString('en-LK');

    return (
      <Card
        onPress={() => router.push(`/budgets/${item.id}`)}
        style={styles.budgetCard}
      >
        <View style={styles.budgetHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.amounts}>
            {spent} / {limit}
          </Text>
        </View>
        <ProgressBar progress={item.progress} height={6} />
        <Text style={styles.remaining}>
          {item.remaining >= 0
            ? `${item.remaining.toLocaleString('en-LK')} remaining`
            : `${Math.abs(item.remaining).toLocaleString('en-LK')} over budget`}
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity
          onPress={() =>
            router.push('/budgets/new' as any)
          }
        >
          <Ionicons name="add-circle-outline" size={26} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading && budgets.length === 0 ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No budgets set</Text>
              <Text style={styles.emptySubtitle}>
                Tap + to create your first category budget
              </Text>
            </View>
          }
        />
      )}
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
  budgetCard: {
    marginBottom: theme.spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  category: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  amounts: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  remaining: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  loader: {
    marginTop: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
