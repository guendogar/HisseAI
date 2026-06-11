import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { Prediction } from '../../types';
import { formatDateTime } from '../../utils';

interface StockAITabProps {
  predictions: Prediction[];
  loading: boolean;
  onPredictPress: () => void;
}

const RESULT_CONFIG = {
  BULLISH: { label: 'Yükseliş Bekleniyor', icon: '📈', color: '#10B981' },
  BEARISH: { label: 'Düşüş Bekleniyor', icon: '📉', color: '#EF4444' },
  NEUTRAL: { label: 'Yatay Bekleniyor', icon: '➡️', color: '#6B7280' },
};

const PERIOD_LABEL: Record<string, string> = {
  '1D': '1 Gün',
  '1W': '1 Hafta',
  '1M': '1 Ay',
};

const ScoreBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => {
  const colors = useColors();
  return (
    <View style={styles.scoreRow}>
      <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.scoreTrack, { backgroundColor: colors.surfaceElevated }]}>
        <View style={[styles.scoreFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.scoreValue, { color }]}>{value}%</Text>
    </View>
  );
};

const StockAITab: React.FC<StockAITabProps> = ({ predictions, loading, onPredictPress }) => {
  const colors = useColors();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Predict Button */}
      <TouchableOpacity
        style={[styles.predictButton, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={onPredictPress}
      >
        <Text style={styles.predictIcon}>🤖</Text>
        <View>
          <Text style={styles.predictTitle}>Tahmin Yap</Text>
          <Text style={styles.predictSubtitle}>Yapay zeka analizi başlat</Text>
        </View>
      </TouchableOpacity>

      {/* Previous Predictions */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 32 }}>🤖</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Henüz tahmin yapılmadı
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
            "Tahmin Yap" butonunu kullanarak analiz başlatın
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Geçmiş Tahminler</Text>
          {predictions.map(pred => {
            const cfg = RESULT_CONFIG[pred.result];
            return (
              <View
                key={pred.id}
                style={[
                  styles.predCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* Header */}
                <View style={styles.predHeader}>
                  <View style={[styles.resultBadge, { backgroundColor: cfg.color + '18' }]}>
                    <Text style={[styles.resultText, { color: cfg.color }]}>
                      {cfg.icon} {cfg.label}
                    </Text>
                  </View>
                  <Text style={[styles.periodBadge, { color: colors.textSecondary, backgroundColor: colors.surfaceElevated }]}>
                    {PERIOD_LABEL[pred.period] ?? pred.period}
                  </Text>
                </View>

                {/* Scores */}
                <ScoreBar label="Güven" value={pred.confidenceScore} color={colors.primary} />
                <ScoreBar label="Risk" value={pred.riskScore} color={colors.warning} />

                {/* Reasons */}
                {pred.reasons.slice(0, 2).map((r, i) => (
                  <View key={i} style={styles.reasonRow}>
                    <View
                      style={[
                        styles.reasonDot,
                        {
                          backgroundColor:
                            r.impact === 'positive'
                              ? colors.positive
                              : r.impact === 'negative'
                              ? colors.negative
                              : colors.neutral,
                        },
                      ]}
                    />
                    <Text style={[styles.reasonText, { color: colors.textSecondary }]} numberOfLines={2}>
                      {r.description}
                    </Text>
                  </View>
                ))}

                {/* Footer */}
                <View style={styles.predFooter}>
                  <Text style={[styles.dataPoints, { color: colors.textMuted }]}>
                    📊 {pred.dataPointsUsed} veri noktası · 📰 {pred.newsCount} haber
                  </Text>
                  <Text style={[styles.predDate, { color: colors.textMuted }]}>
                    {formatDateTime(pred.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: Spacing.base, paddingBottom: Spacing['3xl'], gap: Spacing.md },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: 16,
  },
  predictIcon: { fontSize: 28 },
  predictTitle: { color: '#fff', fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  predictSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: FontSizes.sm },
  emptyContainer: { alignItems: 'center', paddingTop: Spacing.xl, gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
  emptySubText: { fontSize: FontSizes.sm, textAlign: 'center' },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.bold },
  predCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  predHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: 8 },
  resultText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  periodBadge: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scoreLabel: { width: 50, fontSize: FontSizes.xs },
  scoreTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  scoreFill: { height: 6, borderRadius: 3 },
  scoreValue: { width: 36, fontSize: FontSizes.xs, fontWeight: FontWeights.bold, textAlign: 'right' },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  reasonDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  reasonText: { flex: 1, fontSize: FontSizes.xs, lineHeight: 16 },
  predFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dataPoints: { fontSize: FontSizes.xs },
  predDate: { fontSize: FontSizes.xs },
});

export default StockAITab;
