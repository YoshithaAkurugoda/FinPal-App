import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, subMonths, addMonths } from 'date-fns';
import { theme } from '@/constants/theme';
import { apiGet } from '@/lib/api';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface MonthlyReport {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categories: CategoryBreakdown[];
}

export default function ReportsScreen() {
  const router = useRouter();
  const [month, setMonth] = useState(new Date());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await apiGet<MonthlyReport>('/reports/monthly', {
        month: format(month, 'yyyy-MM'),
      });
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => setMonth((m) => subMonths(m, 1));
  const nextMonth = () => setMonth((m) => addMonths(m, 1));

  const fmt = (n: number) =>
    n.toLocaleString('en-LK', { minimumFractionDigits: 2 });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(month, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                  +{fmt(report?.totalIncome ?? 0)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
                  -{fmt(report?.totalExpenses ?? 0)}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.netRow}>
              <Text style={styles.summaryLabel}>Net Savings</Text>
              <Text
                style={[
                  styles.netValue,
                  {
                    color:
                      (report?.netSavings ?? 0) >= 0
                        ? theme.colors.success
                        : theme.colors.danger,
                  },
                ]}
              >
                {fmt(report?.netSavings ?? 0)}
              </Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {report?.categories && report.categories.length > 0 ? (
            report.categories.map((cat) => (
              <View key={cat.category} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <Text style={styles.catName}>{cat.category}</Text>
                  <Text style={styles.catAmount}>{fmt(cat.amount)}</Text>
                </View>
                <ProgressBar
                  progress={cat.percentage / 100}
                  height={6}
                  color={theme.colors.primary}
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No data for this month yet
            </Text>
          )}
        </ScrollView>
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  monthBtn: {
    padding: theme.spacing.sm,
  },
  monthText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 140,
    textAlign: 'center',
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceLight,
    marginVertical: theme.spacing.md,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  catRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  catName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  catAmount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
    fontSize: theme.fontSize.sm,
  },
  loader: {
    marginTop: 60,
  },
});
