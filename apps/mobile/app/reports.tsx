import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, subMonths, addMonths } from 'date-fns';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { theme } from '@/constants/theme';
import { apiGet } from '@/lib/api';
import { useCurrency, formatAmount } from '@/lib/format';
import Card from '@/components/Card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48; // horizontal padding

interface CategoryData {
  category: string;
  total: number;
  percentage: number;
}

interface MonthlyReport {
  month: number;
  year: number;
  totalSpend: number;
  transactionCount: number;
  categories: CategoryData[];
}

interface SavingsSnapshot {
  label: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

interface SavingsTrend {
  snapshots: SavingsSnapshot[];
}

interface IncomePerc {
  category: string;
  total: number;
  percentOfIncome: number;
}

interface IncomeReport {
  monthlyIncome: number;
  categories: IncomePerc[];
  totalSpend: number;
  totalPercentOfIncome: number;
}

type Tab = 'monthly' | 'savings' | 'income';

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#4CAF50',
  Dining: '#FF9800',
  Transport: '#2196F3',
  Health: '#E91E63',
  Shopping: '#9C27B0',
  Entertainment: '#00BCD4',
  Utilities: '#FF5722',
  Savings: '#03A9F4',
  Transfer: '#607D8B',
  Other: '#9E9E9E',
};

function colorFor(cat: string) {
  return CATEGORY_COLORS[cat] ?? theme.colors.primary;
}

export default function ReportsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('monthly');
  const [month, setMonth] = useState(new Date());
  const currency = useCurrency();

  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [savingsTrend, setSavingsTrend] = useState<SavingsTrend | null>(null);
  const [incomeReport, setIncomeReport] = useState<IncomeReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tab, month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'monthly') {
        const data = await apiGet<MonthlyReport>('/reports/monthly', {
          month: month.getMonth() + 1,
          year: month.getFullYear(),
        });
        setMonthly(data);
      } else if (tab === 'savings') {
        const data = await apiGet<SavingsTrend>('/reports/savings-trend', { months: 6 });
        setSavingsTrend(data);
      } else {
        const data = await apiGet<IncomeReport>('/reports/income-percentages', {
          month: month.getMonth() + 1,
          year: month.getFullYear(),
        });
        setIncomeReport(data);
      }
    } catch {
      // errors are silent
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => formatAmount(n, currency);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['monthly', 'savings', 'income'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'monthly' ? 'Monthly' : t === 'savings' ? 'Savings' : 'vs Income'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Month Selector */}
      {tab !== 'savings' && (
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => setMonth((m) => subMonths(m, 1))} style={styles.monthBtn}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{format(month, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setMonth((m) => addMonths(m, 1))} style={styles.monthBtn}>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ─── MONTHLY TAB ─── */}
          {tab === 'monthly' && monthly && (
            <>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryBig}>{fmt(monthly.totalSpend)}</Text>
                <Text style={styles.summaryLabel}>
                  Total Spend · {monthly.transactionCount} transactions
                </Text>
              </Card>

              {monthly.categories.length > 0 && (
                <>
                  {/* Pie chart */}
                  <Text style={styles.sectionTitle}>Category Breakdown</Text>
                  <Card style={styles.chartCard}>
                    <PieChart
                      data={monthly.categories.map((c) => ({
                        value: c.total,
                        color: colorFor(c.category),
                        text: `${c.percentage}%`,
                        label: c.category,
                      }))}
                      donut
                      radius={80}
                      innerRadius={50}
                      centerLabelComponent={() => (
                        <View style={styles.pieCenter}>
                          <Text style={styles.pieCenterText}>{monthly.categories.length}</Text>
                          <Text style={styles.pieCenterLabel}>categories</Text>
                        </View>
                      )}
                      textColor={theme.colors.text}
                      textSize={10}
                    />
                    {/* Legend */}
                    <View style={styles.legend}>
                      {monthly.categories.map((c) => (
                        <View key={c.category} style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: colorFor(c.category) }]} />
                          <Text style={styles.legendText} numberOfLines={1}>
                            {c.category}
                          </Text>
                          <Text style={styles.legendAmt}>{fmt(c.total)}</Text>
                        </View>
                      ))}
                    </View>
                  </Card>

                  {/* Bar chart */}
                  <Text style={styles.sectionTitle}>Spend by Category</Text>
                  <Card style={styles.chartCard}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <BarChart
                        data={monthly.categories.map((c) => ({
                          value: c.total,
                          label: c.category.slice(0, 5),
                          frontColor: colorFor(c.category),
                        }))}
                        barWidth={32}
                        spacing={14}
                        barBorderRadius={4}
                        yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                        noOfSections={4}
                        maxValue={monthly.totalSpend * 1.1}
                        hideRules
                        backgroundColor={theme.colors.surface}
                        yAxisColor="transparent"
                        xAxisColor={theme.colors.surfaceLight}
                      />
                    </ScrollView>
                  </Card>
                </>
              )}

              {monthly.categories.length === 0 && (
                <Text style={styles.empty}>No transactions this month</Text>
              )}
            </>
          )}

          {/* ─── SAVINGS TREND TAB ─── */}
          {tab === 'savings' && savingsTrend && (
            <>
              <Text style={styles.sectionTitle}>6-Month Income vs Expenses</Text>
              <Card style={styles.chartCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={savingsTrend.snapshots.map((s) => ({
                      value: s.income,
                      dataPointText: '',
                    }))}
                    data2={savingsTrend.snapshots.map((s) => ({
                      value: s.expenses,
                      dataPointText: '',
                    }))}
                    color={theme.colors.success}
                    color2={theme.colors.danger}
                    thickness={2}
                    thickness2={2}
                    dataPointsColor={theme.colors.success}
                    dataPointsColor2={theme.colors.danger}
                    dataPointsRadius={4}
                    xAxisLabelTexts={savingsTrend.snapshots.map((s) => s.label.slice(0, 3))}
                    xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                    yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                    noOfSections={4}
                    hideRules
                    backgroundColor={theme.colors.surface}
                    yAxisColor="transparent"
                    xAxisColor={theme.colors.surfaceLight}
                    curved
                  />
                </ScrollView>
                {/* Line legend */}
                <View style={styles.lineLegend}>
                  <View style={styles.lineLegendItem}>
                    <View style={[styles.lineDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={styles.legendText}>Income</Text>
                  </View>
                  <View style={styles.lineLegendItem}>
                    <View style={[styles.lineDot, { backgroundColor: theme.colors.danger }]} />
                    <Text style={styles.legendText}>Expenses</Text>
                  </View>
                </View>
              </Card>

              <Text style={styles.sectionTitle}>Monthly Savings</Text>
              {savingsTrend.snapshots.map((s) => (
                <Card key={s.label} style={styles.trendCard}>
                  <View style={styles.trendHeader}>
                    <Text style={styles.trendLabel}>{s.label}</Text>
                    <Text
                      style={[
                        styles.trendSavings,
                        { color: s.savings >= 0 ? theme.colors.success : theme.colors.danger },
                      ]}
                    >
                      {s.savings >= 0 ? '+' : ''}{fmt(s.savings)}
                    </Text>
                  </View>
                  <Text style={styles.trendRate}>Savings rate: {s.savingsRate.toFixed(1)}%</Text>
                </Card>
              ))}
            </>
          )}

          {/* ─── INCOME % TAB ─── */}
          {tab === 'income' && incomeReport && (
            <>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryBig}>{incomeReport.totalPercentOfIncome.toFixed(1)}%</Text>
                <Text style={styles.summaryLabel}>
                  of monthly income ({fmt(incomeReport.monthlyIncome)}) spent
                </Text>
              </Card>

              {incomeReport.categories.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Spend vs Income %</Text>
                  <Card style={styles.chartCard}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <BarChart
                        data={incomeReport.categories.map((c) => ({
                          value: c.percentOfIncome,
                          label: c.category.slice(0, 5),
                          frontColor:
                            c.percentOfIncome > 30
                              ? theme.colors.danger
                              : c.percentOfIncome > 15
                              ? theme.colors.warning
                              : colorFor(c.category),
                        }))}
                        barWidth={32}
                        spacing={14}
                        barBorderRadius={4}
                        yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                        noOfSections={4}
                        maxValue={Math.max(...incomeReport.categories.map((c) => c.percentOfIncome)) * 1.2 || 100}
                        hideRules
                        backgroundColor={theme.colors.surface}
                        yAxisColor="transparent"
                        xAxisColor={theme.colors.surfaceLight}
                      />
                    </ScrollView>
                  </Card>

                  <Text style={styles.sectionTitle}>Category Detail</Text>
                  {incomeReport.categories.map((cat) => (
                    <Card key={cat.category} style={styles.catDetailCard}>
                      <View style={styles.catDetailRow}>
                        <View style={[styles.catDot, { backgroundColor: colorFor(cat.category) }]} />
                        <Text style={styles.catName}>{cat.category}</Text>
                        <Text style={styles.catPct}>{cat.percentOfIncome.toFixed(1)}%</Text>
                        <Text style={styles.catAmt}>{fmt(cat.total)}</Text>
                      </View>
                    </Card>
                  ))}
                </>
              )}

              {incomeReport.categories.length === 0 && (
                <Text style={styles.empty}>No data for this month</Text>
              )}
            </>
          )}
        </ScrollView>
      )}
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xs ?? 4,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  monthBtn: { padding: theme.spacing.sm },
  monthText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 140,
    textAlign: 'center',
  },
  loader: { marginTop: 60 },
  content: { padding: theme.spacing.md, paddingBottom: 40 },
  summaryCard: { alignItems: 'center', paddingVertical: theme.spacing.lg, marginBottom: theme.spacing.md },
  summaryBig: { fontSize: 28, fontWeight: '800', color: theme.colors.text },
  summaryLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs, marginTop: 4 },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  chartCard: { marginBottom: theme.spacing.md, alignItems: 'center', padding: theme.spacing.md },
  pieCenter: { alignItems: 'center' },
  pieCenterText: { color: theme.colors.text, fontSize: 22, fontWeight: '800' },
  pieCenterLabel: { color: theme.colors.textSecondary, fontSize: 10 },
  legend: { width: '100%', marginTop: theme.spacing.md, gap: 6 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: theme.colors.text, fontSize: theme.fontSize.xs, flex: 1 },
  legendAmt: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  lineLegend: { flexDirection: 'row', gap: 16, marginTop: theme.spacing.sm },
  lineLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lineDot: { width: 12, height: 3, borderRadius: 2 },
  trendCard: { marginBottom: theme.spacing.sm },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  trendLabel: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text },
  trendSavings: { fontSize: theme.fontSize.sm, fontWeight: '700' },
  trendRate: { fontSize: 11, color: theme.colors.textSecondary },
  catDetailCard: { marginBottom: theme.spacing.xs ?? 4 },
  catDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { color: theme.colors.text, fontSize: theme.fontSize.sm, flex: 1 },
  catPct: { color: theme.colors.primary, fontSize: theme.fontSize.sm, fontWeight: '700', width: 45, textAlign: 'right' },
  catAmt: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs, width: 90, textAlign: 'right' },
  empty: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: theme.fontSize.sm,
  },
});
