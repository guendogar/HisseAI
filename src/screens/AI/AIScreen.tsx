import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { useAIReports } from '../../hooks/useAIPrediction';
import { Prediction } from '../../types';
import { formatDateTime } from '../../utils';

const RESULT_CONFIG = {
  BULLISH: { label: 'Yükseliş', icon: '📈', color: '#10B981' },
  BEARISH: { label: 'Düşüş', icon: '📉', color: '#EF4444' },
  NEUTRAL: { label: 'Yatay', icon: '➡️', color: '#6B7280' },
};

const PERIOD_LABEL: Record<string, string> = {
  '1D': '1G', '1W': '1H', '1M': '1A',
};

const StatCard: React.FC<{ label: string; value: string | number; color?: string; colors: any }> = ({
  label, value, color, colors,
}) => (
  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Text style={[styles.statValue, { color: color ?? colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
  </View>
);

const PredictionRow: React.FC<{ item: Prediction; colors: any }> = ({ item, colors }) => {
  const cfg = RESULT_CONFIG[item.result];
  const isResolved = item.isCorrect !== undefined;
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowSymbol, { color: colors.text }]}>{item.symbol}</Text>
        <Text style={[styles.rowPeriod, { color: colors.textMuted }]}>
          {PERIOD_LABEL[item.period]} · {formatDateTime(item.createdAt)}
        </Text>
      </View>

      <View style={styles.rowMid}>
        <View style={[styles.resultChip, { backgroundColor: cfg.color + '20' }]}>
          <Text style={[styles.resultChipText, { color: cfg.color }]}>
            {cfg.icon} {cfg.label}
          </Text>
        </View>
        <Text style={[styles.confText, { color: colors.textSecondary }]}>
          %{item.confidenceScore} güven
        </Text>
      </View>

      {isResolved ? (
        <View style={[
          styles.outcomeBadge,
          { backgroundColor: item.isCorrect ? '#10B98120' : '#EF444420' },
        ]}>
          <Text style={{ color: item.isCorrect ? '#10B981' : '#EF4444', fontSize: FontSizes.xs, fontWeight: FontWeights.bold }}>
            {item.isCorrect ? '✓' : '✗'}
          </Text>
        </View>
      ) : (
        <View style={[styles.outcomeBadge, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={{ color: colors.textMuted, fontSize: FontSizes.xs }}>⏳</Text>
        </View>
      )}
    </View>
  );
};

const AIScreen: React.FC = () => {
  const colors = useColors();
  const { predictions, stats, clearAll } = useAIReports();

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm tahmin geçmişi silinecek. Onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Temizle', style: 'destructive', onPress: clearAll },
      ],
    );
  }, [clearAll]);

  const renderItem = useCallback(
    ({ item }: { item: Prediction }) => <PredictionRow item={item} colors={colors} />,
    [colors],
  );

  const successRate = stats.successRate.toFixed(1);
  const avgConf = stats.avgConfidence.toFixed(1);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Raporu</Text>
        {predictions.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={[styles.clearBtn, { color: colors.danger }]}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Toplam" value={stats.total} colors={colors} />
        <StatCard label="Doğru" value={stats.correct} color="#10B981" colors={colors} />
        <StatCard label="Yanlış" value={stats.incorrect} color="#EF4444" colors={colors} />
        <StatCard label="Başarı" value={`%${successRate}`} color={colors.primary} colors={colors} />
      </View>

      {/* Avg confidence bar */}
      {stats.total > 0 && (
        <View style={[styles.confBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.confBarLabel, { color: colors.textSecondary }]}>
            Ort. Güven Skoru
          </Text>
          <View style={[styles.confTrack, { backgroundColor: colors.surfaceElevated }]}>
            <View
              style={[styles.confFill, { width: `${parseFloat(avgConf)}%`, backgroundColor: colors.primary }]}
            />
          </View>
          <Text style={[styles.confBarValue, { color: colors.primary }]}>%{avgConf}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={predictions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          predictions.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🤖</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Tahmin Yok</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Hisse detay sayfasındaki{'\n'}«Tahmin Yap» butonu ile başlayın.
            </Text>
          </View>
        }
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl + 8,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold },
  clearBtn: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  statLabel: { fontSize: FontSizes.xs, marginTop: 2 },
  confBar: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  confBarLabel: { fontSize: FontSizes.xs, width: 100 },
  confTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  confFill: { height: 6, borderRadius: 3 },
  confBarValue: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, width: 36, textAlign: 'right' },
  list: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  rowLeft: { flex: 1 },
  rowSymbol: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  rowPeriod: { fontSize: FontSizes.xs, marginTop: 2 },
  rowMid: { alignItems: 'flex-end', gap: 3 },
  resultChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  resultChipText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  confText: { fontSize: FontSizes.xs },
  outcomeBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  emptyText: { fontSize: FontSizes.sm, textAlign: 'center', lineHeight: 20 },
});

export default AIScreen;
