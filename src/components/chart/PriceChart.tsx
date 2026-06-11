import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import { useColors } from '../../theme';
import { Spacing } from '../../theme/spacing';
import { FontSizes } from '../../theme/typography';
import { StockHistory } from '../../types';
import { formatPrice } from '../../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - Spacing.base * 2;
const CHART_HEIGHT = 180;
const PADDING = { top: 16, bottom: 32, left: 8, right: 8 };

interface PriceChartProps {
  data: StockHistory[];
  loading?: boolean;
  currency?: string;
  color?: string;
}

const PriceChart: React.FC<PriceChartProps> = memo(({ data, loading, currency = 'TRY', color }) => {
  const colors = useColors();
  const lineColor = color ?? colors.primary;

  const { path, gradientPath, minPrice, maxPrice, yLabels } = useMemo(() => {
    if (data.length < 2) return { path: '', gradientPath: '', minPrice: 0, maxPrice: 0, yLabels: [] };

    const prices = data.map(d => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const drawWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const drawHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const toX = (i: number) => PADDING.left + (i / (data.length - 1)) * drawWidth;
    const toY = (v: number) => PADDING.top + (1 - (v - min) / range) * drawHeight;

    let d = `M ${toX(0)} ${toY(prices[0])}`;
    for (let i = 1; i < prices.length; i++) {
      const cpX = (toX(i - 1) + toX(i)) / 2;
      d += ` C ${cpX} ${toY(prices[i - 1])}, ${cpX} ${toY(prices[i])}, ${toX(i)} ${toY(prices[i])}`;
    }

    const gradPath =
      d +
      ` L ${toX(prices.length - 1)} ${CHART_HEIGHT - PADDING.bottom}` +
      ` L ${toX(0)} ${CHART_HEIGHT - PADDING.bottom} Z`;

    const steps = 3;
    const yl = Array.from({ length: steps + 1 }, (_, i) => ({
      value: min + (range * i) / steps,
      y: toY(min + (range * i) / steps),
    }));

    return { path: d, gradientPath: gradPath, minPrice: min, maxPrice: max, yLabels: yl };
  }, [data]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (data.length < 2) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[styles.empty, { color: colors.textMuted }]}>Grafik verisi bekleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yLabels.map((yl, i) => (
          <React.Fragment key={i}>
            <Line
              x1={PADDING.left}
              y1={yl.y}
              x2={CHART_WIDTH - PADDING.right}
              y2={yl.y}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
            <SvgText
              x={CHART_WIDTH - PADDING.right}
              y={yl.y - 3}
              fontSize={8}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {formatPrice(yl.value, currency)}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Gradient fill */}
        <Path d={gradientPath} fill="url(#chartGrad)" />

        {/* Price line */}
        <Path d={path} stroke={lineColor} strokeWidth={2} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.base,
  },
  center: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { fontSize: FontSizes.sm },
});

export default PriceChart;
