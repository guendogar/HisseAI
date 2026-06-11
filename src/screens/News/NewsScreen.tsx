import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { useNews } from '../../hooks/useNews';
import { NewsArticle } from '../../types';

const CATEGORIES = [
  { key: undefined, label: 'Tümü' },
  { key: 'earnings', label: 'Kazanç' },
  { key: 'macro', label: 'Makro' },
  { key: 'analyst', label: 'Analist' },
  { key: 'merger', label: 'M&A' },
  { key: 'dividend', label: 'Temettü' },
];

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#94a3b8',
};
const SENTIMENT_LABELS: Record<string, string> = {
  positive: '▲ Olumlu',
  negative: '▼ Olumsuz',
  neutral: '● Nötr',
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}d`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
  return `${Math.floor(diff / 86400)}g`;
}

const NewsCard: React.FC<{ item: NewsArticle; colors: any }> = ({ item, colors }) => {
  const handlePress = useCallback(() => {
    if (item.sourceUrl) Linking.openURL(item.sourceUrl).catch(() => {});
  }, [item.sourceUrl]);

  const sentColor = SENTIMENT_COLORS[item.sentiment] ?? '#94a3b8';
  const sentLabel = SENTIMENT_LABELS[item.sentiment] ?? '● Nötr';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={[styles.sentBadge, { backgroundColor: sentColor + '20' }]}>
          <Text style={[styles.sentText, { color: sentColor }]}>{sentLabel}</Text>
        </View>
        <Text style={[styles.timeText, { color: colors.textMuted }]}>{timeAgo(item.publishedAt)}</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
        {item.title}
      </Text>

      {item.summary ? (
        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.summary}
        </Text>
      ) : null}

      <View style={styles.cardBottom}>
        <Text style={[styles.source, { color: colors.primary }]}>{item.source}</Text>
        {item.relatedSymbols?.length > 0 && (
          <View style={styles.symbols}>
            {item.relatedSymbols.slice(0, 3).map(s => (
              <View key={s} style={[styles.symbolChip, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.symbolText, { color: colors.primary }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const NewsScreen: React.FC = () => {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { articles, loading, refreshing, error, hasMore, refresh, loadMore } = useNews({
    category: selectedCategory,
  });

  const renderItem = useCallback(
    ({ item }: { item: NewsArticle }) => <NewsCard item={item} colors={colors} />,
    [colors],
  );

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }, [hasMore, colors.primary]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Piyasa Haberleri</Text>
        <Text style={[styles.headerCount, { color: colors.textMuted }]}>
          {articles.length} haber
        </Text>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryBar}
        renderItem={({ item: c }) => {
          const active = c.key === selectedCategory;
          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: active ? colors.primary : colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setSelectedCategory(c.key)}
            >
              <Text style={[styles.categoryText, { color: active ? '#fff' : colors.textSecondary }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Error */}
      {error && !loading && (
        <View style={styles.errorBox}>
          <Text style={{ color: colors.danger }}>{error}</Text>
        </View>
      )}

      {/* Loading */}
      {loading && articles.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Haberler yükleniyor…</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            articles.length === 0 && { flex: 1 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 40 }}>📰</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Haber Bulunamadı</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Seçilen kategoride haber yok.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
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
  headerCount: { fontSize: FontSizes.sm },
  categoryBar: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, gap: Spacing.xs },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  sentText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  timeText: { fontSize: FontSizes.xs },
  title: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, lineHeight: 20 },
  summary: { fontSize: FontSizes.xs, lineHeight: 17 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  source: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  symbols: { flexDirection: 'row', gap: 4 },
  symbolChip: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  symbolText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  footer: { paddingVertical: Spacing.lg, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingText: { fontSize: FontSizes.sm, marginTop: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  emptyText: { fontSize: FontSizes.sm, textAlign: 'center' },
  errorBox: { margin: Spacing.base, padding: Spacing.md, alignItems: 'center' },
});

export default NewsScreen;
