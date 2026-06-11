import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { NewsArticle } from '../../types';
import { timeAgo } from '../../utils';

interface StockNewsTabProps {
  news: NewsArticle[];
  loading: boolean;
}

const SENTIMENT_CONFIG = {
  positive: { icon: '📈', color: '#10B981' },
  negative: { icon: '📉', color: '#EF4444' },
  neutral: { icon: '➡️', color: '#6B7280' },
};

const StockNewsTab: React.FC<StockNewsTabProps> = ({ news, loading }) => {
  const colors = useColors();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (news.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: FontSizes['3xl'] }}>📰</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Haber bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {news.map(article => {
        const sentiment = SENTIMENT_CONFIG[article.sentiment];
        return (
          <TouchableOpacity
            key={article.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => article.sourceUrl && Linking.openURL(article.sourceUrl)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.sourceBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.sourceText, { color: colors.primary }]}>{article.source}</Text>
              </View>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {timeAgo(article.publishedAt)}
              </Text>
              <Text style={styles.sentimentIcon}>{sentiment.icon}</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
              {article.title}
            </Text>

            {article.summary ? (
              <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
                {article.summary}
              </Text>
            ) : null}

            {article.relatedSymbols.length > 0 && (
              <View style={styles.symbolsRow}>
                {article.relatedSymbols.slice(0, 4).map(sym => (
                  <View key={sym} style={[styles.symbolBadge, { backgroundColor: colors.surfaceElevated }]}>
                    <Text style={[styles.symbolBadgeText, { color: colors.textSecondary }]}>
                      {sym}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: Spacing.base, paddingBottom: Spacing['3xl'], gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing['3xl'] },
  emptyText: { fontSize: FontSizes.base, marginTop: Spacing.sm },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sourceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourceText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  timeText: { fontSize: FontSizes.xs, flex: 1 },
  sentimentIcon: { fontSize: 14 },
  title: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, lineHeight: 18, marginBottom: 4 },
  summary: { fontSize: FontSizes.xs, lineHeight: 16, marginBottom: Spacing.sm },
  symbolsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: Spacing.xs },
  symbolBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  symbolBadgeText: { fontSize: FontSizes.xs },
});

export default StockNewsTab;
