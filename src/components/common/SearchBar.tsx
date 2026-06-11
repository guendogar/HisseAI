import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useColors } from '../../theme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { FontSizes } from '../../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Hisse ara... (THYAO, AAPL)',
}) => {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const onFocus = () =>
    Animated.spring(scale, { toValue: 1.01, useNativeDriver: true }).start();
  const onBlur = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <View
        style={[
          styles.inner,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.icon, { color: colors.textMuted }]}>🔍</Text>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.clear, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  icon: { fontSize: 16, marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSizes.base, paddingVertical: 0 },
  clear: { fontSize: 14, paddingLeft: Spacing.sm },
});

export default SearchBar;
