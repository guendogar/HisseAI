import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { useNotifications } from '../../hooks/useNotifications';
import { AppNotification } from '../../types';
import { formatDateTime } from '../../utils';

const TYPE_CONFIG: Record<AppNotification['type'], { icon: string; label: string }> = {
  price_alert: { icon: '🔔', label: 'Fiyat Alarmı' },
  ai_prediction: { icon: '🤖', label: 'AI Tahmini' },
  news: { icon: '📰', label: 'Haber' },
  watchlist: { icon: '📋', label: 'Takip Listesi' },
};

type TabKey = 'history' | 'alerts' | 'prefs';

const NotificationsScreen: React.FC = () => {
  const colors = useColors();
  const [tab, setTab] = useState<TabKey>('history');
  const {
    notifications,
    alerts,
    prefs,
    unreadCount,
    readNotification,
    readAll,
    clearNotifications,
    deleteAlert,
    updateNotifPrefs,
  } = useNotifications();

  const handleClearAll = useCallback(() => {
    Alert.alert('Geçmişi Temizle', 'Tüm bildirimler silinecek.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Temizle', style: 'destructive', onPress: clearNotifications },
    ]);
  }, [clearNotifications]);

  const renderNotif = useCallback(
    ({ item }: { item: AppNotification }) => {
      const cfg = TYPE_CONFIG[item.type];
      return (
        <TouchableOpacity
          style={[
            styles.notifRow,
            {
              backgroundColor: item.isRead ? colors.surface : colors.primary + '10',
              borderColor: colors.border,
            },
          ]}
          onPress={() => readNotification(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.notifIcon}>{cfg.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.notifTitleRow}>
              <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              {!item.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={[styles.notifDate, { color: colors.textMuted }]}>
              {cfg.label} · {formatDateTime(item.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, readNotification],
  );

  const renderAlert = useCallback(
    ({ item }: { item: any }) => (
      <View style={[styles.alertRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.alertSymbol, { color: colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.alertDetail, { color: colors.textSecondary }]}>
            {item.direction === 'above' ? '▲ Üzerine geçerse' : '▼ Altına düşerse'} {item.targetPrice}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteAlert(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.deleteIcon, { color: colors.danger }]}>🗑</Text>
        </TouchableOpacity>
      </View>
    ),
    [colors, deleteAlert],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Bildirimler {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        {tab === 'history' && notifications.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={readAll}>
              <Text style={[styles.headerAction, { color: colors.primary }]}>Tümünü Oku</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={[styles.headerAction, { color: colors.danger }]}>Temizle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {(['history', 'alerts', 'prefs'] as TabKey[]).map(t => {
          const label = t === 'history' ? '📥 Geçmiş' : t === 'alerts' ? '🔔 Alarmlar' : '⚙️ Tercihler';
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tab, { borderBottomColor: tab === t ? colors.primary : 'transparent' }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.textSecondary }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* History */}
      {tab === 'history' && (
        <FlatList
          data={notifications}
          renderItem={renderNotif}
          keyExtractor={i => i.id}
          contentContainerStyle={[styles.list, notifications.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🔔</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Bildirim yok</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Alerts */}
      {tab === 'alerts' && (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={i => i.id}
          contentContainerStyle={[styles.list, alerts.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🔕</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Fiyat alarmı yok</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Prefs */}
      {tab === 'prefs' && (
        <View style={{ padding: Spacing.base, gap: Spacing.sm }}>
          {[
            { key: 'priceAlerts', label: '🔔 Fiyat Alarmları', desc: 'Hedef fiyata ulaşıldığında bildir' },
            { key: 'aiPredictions', label: '🤖 AI Tahminleri', desc: 'Tahmin tamamlandığında bildir' },
            { key: 'news', label: '📰 Haberler', desc: 'Önemli haberler için bildir' },
            { key: 'watchlist', label: '📋 Takip Listesi', desc: 'Takip listenizdeki hisseler için bildir' },
            { key: 'silentMode', label: '🔇 Sessiz Mod', desc: 'Tüm bildirimleri sustur' },
          ].map(item => (
            <View
              key={item.key}
              style={[styles.prefRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.prefDesc, { color: colors.textMuted }]}>{item.desc}</Text>
              </View>
              <Switch
                value={prefs[item.key as keyof typeof prefs] as boolean}
                onValueChange={val => updateNotifPrefs({ [item.key]: val })}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      )}
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
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  headerAction: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: Spacing.base },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 2 },
  tabText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  notifRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  notifIcon: { fontSize: 22, marginTop: 2 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  notifTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  notifBody: { fontSize: FontSizes.xs, lineHeight: 16, marginTop: 2 },
  notifDate: { fontSize: FontSizes.xs, marginTop: 4 },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertSymbol: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  alertDetail: { fontSize: FontSizes.xs, marginTop: 2 },
  deleteIcon: { fontSize: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  prefLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  prefDesc: { fontSize: FontSizes.xs, marginTop: 2 },
});

export default NotificationsScreen;
