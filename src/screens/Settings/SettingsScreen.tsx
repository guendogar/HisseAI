import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '../../theme';
import { Spacing } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import {
  toggleAutoAnalysis,
  toggleNotifications,
  setThemeMode,
} from '../../store/slices/settingsSlice';
import { clearPredictions } from '../../store/slices/aiSlice';
import { cache } from '../../services/cache';
import { STORAGE_KEYS } from '../../constants';
import { useAIReports } from '../../hooks/useAIPrediction';

// ─── Row Components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; colors: any }> = ({ title, colors }) => (
  <Text style={[styles.sectionHeader, { color: colors.primary }]}>{title}</Text>
);

const InfoRow: React.FC<{ label: string; value: string | number; colors: any }> = ({
  label, value, colors,
}) => (
  <View style={[styles.row, { borderBottomColor: colors.border }]}>
    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const ToggleRow: React.FC<{
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
  colors: any;
}> = ({ label, description, value, onToggle, colors }) => (
  <View style={[styles.row, { borderBottomColor: colors.border }]}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      {description ? (
        <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{description}</Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#374151', true: '#3B82F6' }}
      thumbColor="#fff"
    />
  </View>
);

const ActionRow: React.FC<{
  label: string;
  description?: string;
  danger?: boolean;
  onPress: () => void;
  colors: any;
}> = ({ label, description, danger, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.row, { borderBottomColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={{ flex: 1 }}>
      <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      {description ? (
        <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{description}</Text>
      ) : null}
    </View>
    <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
  const colors = useColors();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(s => s.settings);
  const { stats, clearAll: clearReports } = useAIReports();
  const aiStats = useAppSelector(s => s.ai.stats);

  const handleClearPredictions = useCallback(() => {
    Alert.alert(
      'Tahminleri Temizle',
      'Tüm AI tahmin geçmişi silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle', style: 'destructive', onPress: async () => {
            dispatch(clearPredictions());
            await AsyncStorage.removeItem(STORAGE_KEYS.AI_REPORTS);
          },
        },
      ],
    );
  }, [dispatch]);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Önbelleği Temizle',
      'Tüm uygulama önbelleği temizlenecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle', style: 'destructive', onPress: () => {
            cache.clear();
            Alert.alert('Başarılı', 'Önbellek temizlendi.');
          },
        },
      ],
    );
  }, []);

  const handleToggleTheme = useCallback(() => {
    dispatch(setThemeMode(settings.themeMode === 'dark' ? 'light' : 'dark'));
  }, [dispatch, settings.themeMode]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Stats */}
        <SectionHeader title="🤖 YZ İstatistikleri" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label="Toplam Tahmin" value={aiStats.total} colors={colors} />
          <InfoRow label="Doğru Tahmin" value={aiStats.correct} colors={colors} />
          <InfoRow label="Başarı Oranı" value={`%${aiStats.successRate.toFixed(1)}`} colors={colors} />
          <InfoRow label="Ort. Güven Skoru" value={`%${aiStats.avgConfidence.toFixed(1)}`} colors={colors} />
          <InfoRow label="Analiz Edilen Veri" value={aiStats.totalDataAnalyzed} colors={colors} />
          <InfoRow label="Analiz Edilen Haber" value={aiStats.totalNewsAnalyzed} colors={colors} />
        </View>

        {/* AI Settings */}
        <SectionHeader title="⚙️ YZ Ayarları" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ToggleRow
            label="Otomatik Analiz"
            description="Hisse açıldığında otomatik tahmin yap"
            value={settings.autoAnalysis}
            onToggle={() => dispatch(toggleAutoAnalysis())}
            colors={colors}
          />
          <ToggleRow
            label="Bildirimler"
            description="AI tahmin bildirimleri"
            value={settings.notificationsEnabled}
            onToggle={() => dispatch(toggleNotifications())}
            colors={colors}
          />
        </View>

        {/* Appearance */}
        <SectionHeader title="🎨 Görünüm" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ToggleRow
            label="Karanlık Mod"
            value={settings.themeMode === 'dark'}
            onToggle={handleToggleTheme}
            colors={colors}
          />
        </View>

        {/* Actions */}
        <SectionHeader title="🗑 Veri Yönetimi" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActionRow
            label="Geçmiş Tahminleri Temizle"
            description="Tüm AI tahmin geçmişini sil"
            danger
            onPress={handleClearPredictions}
            colors={colors}
          />
          <ActionRow
            label="Önbelleği Temizle"
            description="API önbelleğini temizle"
            onPress={handleClearCache}
            colors={colors}
          />
        </View>

        {/* App Info */}
        <SectionHeader title="ℹ️ Uygulama" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label="Versiyon" value="1.0.0" colors={colors} />
          <InfoRow label="Desteklenen Piyasalar" value="BIST, NASDAQ, NYSE, EU" colors={colors} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl + 8,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold },
  content: { padding: Spacing.base, gap: Spacing.xs, paddingBottom: Spacing['3xl'] },
  sectionHeader: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  rowDesc: { fontSize: FontSizes.xs, marginTop: 2 },
  rowValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  chevron: { fontSize: 20 },
});

export default SettingsScreen;
