import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';

export type SortKey = 'name' | 'price' | 'change' | 'volume';

interface SortPickerProps {
  selected: SortKey;
  onSelect: (key: SortKey) => void;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'change', label: '% Değişim' },
  { key: 'price', label: 'Fiyat' },
  { key: 'volume', label: 'Hacim' },
  { key: 'name', label: 'İsim' },
];

const SortPicker: React.FC<SortPickerProps> = ({ selected, onSelect }) => {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Sırala:</Text>
      {SORTS.map(({ key, label }) => {
        const active = selected === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            activeOpacity={0.75}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary + '22' : 'transparent',
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: active ? colors.primary : colors.textSecondary },
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
    alignItems: 'center',
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  label: { fontSize: FontSizes.sm, marginRight: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
});

export default SortPicker;
