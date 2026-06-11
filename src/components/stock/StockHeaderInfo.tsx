import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { formatPercent, formatPrice, formatCompact } from '../../utils';
import { Stock } from '../../types';

interface StockHeaderInfoProps {
  stock: Stock;
}

const StatBox: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor,
}) => {
  const colors = useColors();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor ?? colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const StockHeaderInfo: React.FC<StockHeaderInfoProps> = memo(({ stock }) => {
  const colors = useColors();
  const price = stock.price;
  const changePercent = price?.changePercent ?? 0;
  const changeAmount = price?.changeAmount ?? 0;
  const isPositive = changePercent >= 0;
  const changeColor = changePercent === 0 ? colors.neutral : isPositive ? colors.positive : colors.negative;

  return (
    <View style={styles.container}>
      {/* Symbol & Market */}
      <View style={styles.symbolRow}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.logoText, { color: colors.primary }]}>
            {stock.symbol.slice(0, 2)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.symbolText, { color: colors.text }]}>{stock.symbol}</Text>
          <Text style={[styles.nameText, { color: colors.textSecondary }]} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
        <View style={[styles.marketBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.marketText, { color: colors.textSecondary }]}>{stock.market}</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={[styles.priceText, { color: colors.text }]}>
          {price ? formatPrice(price.current, stock.currency) : '—'}
        </Text>
        <View style={[styles.changeBadge, { backgroundColor: changeColor + '18' }]}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {isPositive ? '▲' : '▼'} {formatPercent(changePercent)}
          </Text>
        </View>
      </View>

      {/* Change amount */}
      {price && (
        <Text style={[styles.changeAmount, { color: changeColor }]}>
          {changeAmount >= 0 ? '+' : ''}{formatPrice(changeAmount, stock.currency)} bugün
        </Text>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatBox
          label="Haftalık"
          value={formatPercent(stock.weeklyChange ?? 0)}
          valueColor={
            (stock.weeklyChange ?? 0) >= 0
              ? colors.positive
              : colors.negative
          }
        />
        <StatBox
          label="Aylık"
          value={formatPercent(stock.monthlyChange ?? 0)}
          valueColor={
            (stock.monthlyChange ?? 0) >= 0
              ? colors.positive
              : colors.negative
          }
        />
        <StatBox
          label="Hacim"
          value={price ? formatCompact(price.volume) : '—'}
        />
        <StatBox
          label="Ort. Hacim"
          value={price ? formatCompact(price.avgVolume) : '—'}
        />
        <StatBox
          label="Yüksek"
          value={price ? formatPrice(price.high, stock.currency) : '—'}
          valueColor={colors.positive}
        />
        <StatBox
          label="Düşük"
          value={price ? formatPrice(price.low, stock.currency) : '—'}
          valueColor={colors.negative}
        />
      </View>

      {/* Description */}
      {stock.description ? (
        <View style={[styles.descContainer, { borderColor: colors.border }]}>
          <Text style={[styles.descTitle, { color: colors.text }]}>Şirket Hakkında</Text>
          <Text style={[styles.descText, { color: colors.textSecondary }]} numberOfLines={4}>
            {stock.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.base },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  symbolText: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  nameText: { fontSize: FontSizes.sm, marginTop: 2 },
  marketBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  marketText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  priceText: { fontSize: FontSizes['3xl'], fontWeight: FontWeights.extrabold },
  changeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold },
  changeAmount: { fontSize: FontSizes.sm, marginBottom: Spacing.base },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statBox: {
    flex: 1,
    minWidth: '30%',
    padding: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  statLabel: { fontSize: FontSizes.xs, marginBottom: 2 },
  statValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  descContainer: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  descTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginBottom: Spacing.xs },
  descText: { fontSize: FontSizes.sm, lineHeight: 18 },
});

export default StockHeaderInfo;
