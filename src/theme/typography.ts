import { StyleSheet } from 'react-native';

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 38,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const Typography = StyleSheet.create({
  h1: { fontSize: FontSizes['4xl'], fontWeight: FontWeights.bold, lineHeight: FontSizes['4xl'] * 1.2 },
  h2: { fontSize: FontSizes['3xl'], fontWeight: FontWeights.bold, lineHeight: FontSizes['3xl'] * 1.2 },
  h3: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.semibold, lineHeight: FontSizes['2xl'] * 1.3 },
  h4: { fontSize: FontSizes.xl, fontWeight: FontWeights.semibold, lineHeight: FontSizes.xl * 1.3 },
  body: { fontSize: FontSizes.base, fontWeight: FontWeights.regular, lineHeight: FontSizes.base * 1.5 },
  bodySmall: { fontSize: FontSizes.md, fontWeight: FontWeights.regular, lineHeight: FontSizes.md * 1.5 },
  caption: { fontSize: FontSizes.sm, fontWeight: FontWeights.regular, lineHeight: FontSizes.sm * 1.4 },
  label: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, lineHeight: FontSizes.xs * 1.4 },
  price: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold },
  priceLarge: { fontSize: FontSizes['3xl'], fontWeight: FontWeights.extrabold },
});
