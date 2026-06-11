import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { Market } from '../../constants';

type Category = 'ALL' | Market;

interface CategoryFilterProps {
  selected: Category;
  onSelect: (cat: Category) => void;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'BIST', label: 'BIST' },
  { key: 'NASDAQ', label: 'NASDAQ' },
  { key: 'NYSE', label: 'NYSE' },
  { key: 'EUROPE', label: 'Avrupa' },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect }) => {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(({ key, label }) => {
        const active = selected === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            activeOpacity={0.75}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? '#fff' : colors.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  label: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
});

export default CategoryFilter;
export type { Category };
