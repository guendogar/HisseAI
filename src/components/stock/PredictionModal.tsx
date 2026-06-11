import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { useAIPrediction } from '../../hooks/useAIPrediction';
import { PredictionPeriod } from '../../constants';
import { formatDateTime } from '../../utils';

const PERIODS: { key: PredictionPeriod; label: string }[] = [
  { key: '1D', label: '1 Gün' },
  { key: '1W', label: '1 Hafta' },
  { key: '1M', label: '1 Ay' },
];

const RESULT_CONFIG = {
  BULLISH: { label: 'Yükseliş Bekleniyor', icon: '📈', color: '#10B981' },
  BEARISH: { label: 'Düşüş Bekleniyor', icon: '📉', color: '#EF4444' },
  NEUTRAL: { label: 'Yatay Bekleniyor', icon: '➡️', color: '#6B7280' },
};

interface Props {
  visible: boolean;
  onClose: () => void;
  stockId: string;
  symbol: string;
  stockName: string;
}

const PredictionModal: React.FC<Props> = ({ visible, onClose, stockId, symbol, stockName }) => {
  const colors = useColors();
  const [selectedPeriod, setSelectedPeriod] = useState<PredictionPeriod>('1W');
  const { prediction, loading, error, predict } = useAIPrediction(stockId, symbol);

  const handlePredict = () => predict(selectedPeriod);

  const cfg = prediction ? RESULT_CONFIG[prediction.result] : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Title */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>🤖 AI Tahmin</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{stockName} ({symbol})</Text>

          {/* Period Picker */}
          <View style={styles.periodRow}>
            {PERIODS.map(p => {
              const active = p.key === selectedPeriod;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.periodBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceElevated,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPeriod(p.key)}
                >
                  <Text style={[styles.periodText, { color: active ? '#fff' : colors.textSecondary }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Predict Button */}
          <TouchableOpacity
            style={[styles.predictBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handlePredict}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.predictBtnText}>Analizi Başlat</Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          )}

          {/* Result */}
          {prediction && cfg && !loading && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: Spacing.md }}>
              {/* Result Badge */}
              <View style={[styles.resultCard, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '40' }]}>
                <Text style={[styles.resultIcon]}>{cfg.icon}</Text>
                <Text style={[styles.resultLabel, { color: cfg.color }]}>{cfg.label}</Text>
              </View>

              {/* Scores */}
              <View style={[styles.scoresRow, { backgroundColor: colors.surfaceElevated }]}>
                <View style={styles.scoreItem}>
                  <Text style={[styles.scoreValue, { color: colors.primary }]}>{prediction.confidenceScore}%</Text>
                  <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>Güven</Text>
                </View>
                <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
                <View style={styles.scoreItem}>
                  <Text style={[styles.scoreValue, { color: colors.warning }]}>{prediction.riskScore}%</Text>
                  <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>Risk</Text>
                </View>
                <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
                <View style={styles.scoreItem}>
                  <Text style={[styles.scoreValue, { color: colors.text }]}>{prediction.dataPointsUsed}</Text>
                  <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>Veri</Text>
                </View>
              </View>

              {/* Reasons */}
              <Text style={[styles.reasonTitle, { color: colors.text }]}>Gerekçeler</Text>
              {prediction.reasons.map((r, i) => {
                const dotColor =
                  r.impact === 'positive' ? '#10B981' : r.impact === 'negative' ? '#EF4444' : '#6B7280';
                return (
                  <View key={i} style={styles.reasonRow}>
                    <View style={[styles.reasonDot, { backgroundColor: dotColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reasonFactor, { color: colors.text }]}>{r.factor}</Text>
                      <Text style={[styles.reasonDesc, { color: colors.textSecondary }]}>{r.description}</Text>
                    </View>
                  </View>
                );
              })}

              <Text style={[styles.predDate, { color: colors.textMuted }]}>
                {formatDateTime(prediction.createdAt)} · {prediction.newsCount} haber analiz edildi
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.base,
    maxHeight: '90%',
    paddingBottom: Spacing['3xl'],
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  closeBtn: { fontSize: 18 },
  subtitle: { fontSize: FontSizes.sm, marginTop: 2, marginBottom: Spacing.md },
  periodRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  periodBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  periodText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  predictBtn: { paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
  predictBtnText: { color: '#fff', fontSize: FontSizes.base, fontWeight: FontWeights.bold },
  errorText: { textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.sm },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  resultIcon: { fontSize: 32 },
  resultLabel: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  scoresRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  scoreItem: { flex: 1, alignItems: 'center' },
  scoreValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  scoreLabel: { fontSize: FontSizes.xs, marginTop: 2 },
  scoreDivider: { width: 1, marginHorizontal: Spacing.sm },
  reasonTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, marginBottom: Spacing.sm },
  reasonRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  reasonDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  reasonFactor: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  reasonDesc: { fontSize: FontSizes.xs, lineHeight: 16 },
  predDate: { fontSize: FontSizes.xs, textAlign: 'center', marginTop: Spacing.md },
});

export default PredictionModal;
