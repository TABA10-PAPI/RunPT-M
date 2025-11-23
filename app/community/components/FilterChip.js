import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { palette, typography } from '@styles/globalStyles';

export default function FilterChip({ label, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: palette.grayMedium,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: palette.green,
  },
  chipText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
    ...typography.semibold,
  },
  chipTextActive: {
    color: palette.black,
    fontSize: 14,
    fontWeight: '700',
    ...typography.bold,
  },
});

