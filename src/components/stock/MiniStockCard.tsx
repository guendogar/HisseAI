import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { Stock } from '../../types';
import { formatPrice, formatPercent } from '../../utils';

interface MiniStockCardProps {
  stock: Stock;
  onPress: () => void;
}

const MiniStockCard: React.FC<MiniStockCardProps> = memo(({ stock, onPress }) => {
  const colors = useColors();
  const changePercent = stock.price?.changePercent ?? 0;
  const isPositive = changePercent >= 0;
  const changeColor = changePercent === 0 ? colors.neutral : isPositive ? colors.positive : colors.negative;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
    >
      <View style={[styles.dot, { backgroundColor: changeColor }]} />
      <Text style={[styles.symbol, { color: colors.text }]}>{stock.symbol}</Text>
      <Text style={[styles.price, { color: colors.text }]}>
        {stock.price?.current ? formatPrice(stock.price.current, stock.currency) : '—'}
      </Text>
      <Text style={[styles.change, { color: changeColor }]}>{formatPercent(changePercent)}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 140,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: Spacing.sm,
    ...Shadows.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: Spacing.xs,
  },
  symbol: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    marginBottom: 2,
  },
  price: {
    fontSize: FontSizes.sm,
    marginBottom: 2,
  },
  change: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
});

export default MiniStockCard;
