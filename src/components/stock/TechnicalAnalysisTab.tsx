import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';

interface TechnicalAnalysisTabProps {
  symbol: string;
}

interface IndicatorRow {
  name: string;
  value: string | number;
  signal: 'buy' | 'sell' | 'neutral';
}

// Simulated indicator data (replaced by real data via AI/data layer in PROMPT 7)
const getMockIndicators = (symbol: string): IndicatorRow[] => [
  { name: 'RSI (14)', value: '58.4', signal: 'neutral' },
  { name: 'MACD (12,26,9)', value: '+0.42', signal: 'buy' },
  { name: 'EMA 20', value: '—', signal: 'neutral' },
  { name: 'EMA 50', value: '—', signal: 'neutral' },
  { name: 'SMA 20', value: '—', signal: 'neutral' },
  { name: 'SMA 50', value: '—', signal: 'neutral' },
  { name: 'Bollinger Üst', value: '—', signal: 'neutral' },
  { name: 'Bollinger Alt', value: '—', signal: 'neutral' },
  { name: 'Stochastic %K', value: '72.1', signal: 'sell' },
  { name: 'ATR (14)', value: '—', signal: 'neutral' },
];

const SIGNAL_CONFIG = {
  buy: { label: 'Al', color: '#10B981' },
  sell: { label: 'Sat', color: '#EF4444' },
  neutral: { label: 'Nötr', color: '#6B7280' },
};

const TechnicalAnalysisTab: React.FC<TechnicalAnalysisTabProps> = ({ symbol }) => {
  const colors = useColors();
  const indicators = getMockIndicators(symbol);

  const buyCount = indicators.filter(i => i.signal === 'buy').length;
  const sellCount = indicators.filter(i => i.signal === 'sell').length;
  const neutralCount = indicators.filter(i => i.signal === 'neutral').length;

  const overallSignal =
    buyCount > sellCount ? 'buy' : sellCount > buyCount ? 'sell' : 'neutral';

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Overall Signal */}
      <View
        style={[
          styles.overallCard,
          {
            backgroundColor: SIGNAL_CONFIG[overallSignal].color + '18',
            borderColor: SIGNAL_CONFIG[overallSignal].color + '44',
          },
        ]}
      >
        <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>
          Genel Sinyal
        </Text>
        <Text style={[styles.overallValue, { color: SIGNAL_CONFIG[overallSignal].color }]}>
          {overallSignal === 'buy' ? '📈 AL' : overallSignal === 'sell' ? '📉 SAT' : '➡️ NÖTR'}
        </Text>
        <View style={styles.signalCounts}>
          <Text style={[styles.signalCount, { color: colors.positive }]}>Al: {buyCount}</Text>
          <Text style={[styles.signalCount, { color: colors.neutral }]}>Nötr: {neutralCount}</Text>
          <Text style={[styles.signalCount, { color: colors.negative }]}>Sat: {sellCount}</Text>
        </View>
      </View>

      {/* Indicators Table */}
      <View style={[styles.tableContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.tableHeaderText, { color: colors.textMuted }]}>Gösterge</Text>
          <Text style={[styles.tableHeaderText, { color: colors.textMuted }]}>Değer</Text>
          <Text style={[styles.tableHeaderText, { color: colors.textMuted }]}>Sinyal</Text>
        </View>
        {indicators.map((ind, idx) => (
          <View
            key={idx}
            style={[
              styles.tableRow,
              {
                borderBottomColor: colors.border,
                borderBottomWidth: idx < indicators.length - 1 ? 1 : 0,
              },
            ]}
          >
            <Text style={[styles.indName, { color: colors.text }]}>{ind.name}</Text>
            <Text style={[styles.indValue, { color: colors.textSecondary }]}>{ind.value}</Text>
            <View
              style={[
                styles.signalBadge,
                { backgroundColor: SIGNAL_CONFIG[ind.signal].color + '18' },
              ]}
            >
              <Text style={[styles.signalText, { color: SIGNAL_CONFIG[ind.signal].color }]}>
                {SIGNAL_CONFIG[ind.signal].label}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        * Teknik göstergeler yatırım tavsiyesi niteliği taşımaz. Gerçek veriler Prompt 7 ile entegre edilecektir.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  overallCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  overallLabel: { fontSize: FontSizes.sm, marginBottom: 4 },
  overallValue: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold, marginBottom: Spacing.sm },
  signalCounts: { flexDirection: 'row', gap: Spacing.base },
  signalCount: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  tableContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  tableHeaderText: { flex: 1, fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  indName: { flex: 1.4, fontSize: FontSizes.sm },
  indValue: { flex: 1, fontSize: FontSizes.sm },
  signalBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  signalText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold },
  disclaimer: { fontSize: FontSizes.xs, textAlign: 'center', marginTop: Spacing.sm },
});

export default TechnicalAnalysisTab;
