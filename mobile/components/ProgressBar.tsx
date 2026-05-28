import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  fill: number; // 0.0 to 1.0
}

export default function ProgressBar({ fill }: Props) {
  const clampedFill = Math.min(1, Math.max(0, fill));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clampedFill * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
