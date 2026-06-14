import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { Stock } from '../../types';
import { formatPrice, formatPercent } from '../../utils';

interface StockCardProps {
  stock: Stock;
  onPress: () => void;
}

const StockCard: React.FC<StockCardProps> = memo(({ stock, onPress }) => {
  const colors = useColors();
  const changePercent = stock.price?.changePercent ?? 0;
  const isPositive = changePercent >= 0;
  const changeColor = changePercent === 0 ? colors.neutral : isPositive ? colors.positive : colors.negative;
  const currentPrice = stock.price?.current ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* Left */}
      <View style={styles.left}>
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.logoText, { color: colors.primary }]}>
            {stock.symbol.slice(0, 2)}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.symbolRow}>
            <Text style={[styles.symbol, { color: colors.text }]} numberOfLines={1}>
              {stock.symbol}
            </Text>
            {/* Canlı / Demo göstergesi */}
            <View style={[
              styles.liveDot,
              { backgroundColor: stock.isLive ? '#22c55e' : '#f59e0b' }
            ]} />
          </View>
          <Text style={[styles.name, { color: colors.textSecondary }]} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
      </View>

      {/* Right */}
      <View style={styles.right}>
        <Text style={[styles.price, { color: colors.text }]}>
          {currentPrice > 0 ? formatPrice(currentPrice, stock.currency) : '—'}
        </Text>
        <View style={[styles.changeBadge, { backgroundColor: changeColor + '18' }]}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {formatPercent(changePercent)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  info: { flex: 1 },
  symbolRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  symbol: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
  name: { fontSize: FontSizes.sm, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  price: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
  changeBadge: {
    marginTop: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  changeText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
});

export default StockCard;
