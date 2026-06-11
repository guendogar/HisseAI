import React, { useMemo } from 'react';
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
import { getSectorColor, getSectorIcon } from '../../utils/stockUtils';

interface SectorFilterProps {
  sectors: string[];
  selected: string | null;
  onSelect: (sector: string | null) => void;
}

const SectorFilter: React.FC<SectorFilterProps> = ({ sectors, selected, onSelect }) => {
  const colors = useColors();

  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => a.localeCompare(b));
  }, [sectors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        onPress={() => onSelect(null)}
        activeOpacity={0.75}
        style={[
          styles.chip,
          {
            backgroundColor: selected === null ? colors.primary : colors.surface,
            borderColor: selected === null ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: selected === null ? '#fff' : colors.textSecondary },
          ]}
        >
          Tümü
        </Text>
      </TouchableOpacity>

      {sortedSectors.map(sector => {
        const active = selected === sector;
        const icon = getSectorIcon(sector);
        return (
          <TouchableOpacity
            key={sector}
            onPress={() => onSelect(sector)}
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
              {icon} {sector}
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
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});

export default SectorFilter;
export type { SectorFilterProps };
