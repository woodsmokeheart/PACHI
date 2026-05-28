import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../constants/theme';

interface Props {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onOk: () => void;
  disabled?: boolean;
}

const ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['⌫', '0', 'OK'],
];

export default function NumericKeyboard({ onDigit, onBackspace, onOk, disabled }: Props) {
  const handleKey = (key: string) => {
    if (disabled) return;
    if (key === '⌫') return onBackspace();
    if (key === 'OK') return onOk();
    onDigit(key);
  };

  return (
    <View style={styles.container}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => handleKey(key)}
              style={({ pressed }) => [
                styles.key,
                key === 'OK' && styles.keyOk,
                pressed && styles.keyPressed,
                disabled && styles.keyDisabled,
              ]}
            >
              <Text style={[styles.keyText, key === 'OK' && styles.keyOkText]}>{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  key: {
    width: SIZES.keySize,
    height: SIZES.keySize,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.keyBackground,
    borderWidth: 1,
    borderColor: COLORS.keyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyOk: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  keyPressed: {
    opacity: 0.6,
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: FONT.sizeMD,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  keyOkText: {
    color: '#FFFFFF',
  },
});
