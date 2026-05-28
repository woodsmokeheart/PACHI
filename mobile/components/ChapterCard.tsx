import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../constants/theme';
import ProgressBar from './ProgressBar';

interface Props {
  title: string;
  completed: number;
  total: number;
  locked: boolean;
  onPress: () => void;
}

export default function ChapterCard({ title, completed, total, locked, onPress }: Props) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        locked && styles.cardLocked,
        pressed && !locked && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, locked && styles.textLocked]} numberOfLines={2}>
          {locked ? '🔒 ' : ''}{title}
        </Text>
      </View>
      <View style={styles.footer}>
        <ProgressBar fill={total > 0 ? completed / total : 0} />
        <Text style={[styles.progress, locked && styles.textLocked]}>
          {completed}/{total} уроков
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.paddingLG,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  cardLocked: {
    backgroundColor: '#F5F5F5',
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT.sizeMD,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  textLocked: {
    color: COLORS.locked,
  },
  footer: {
    gap: 6,
  },
  progress: {
    fontSize: FONT.sizeXS,
    color: COLORS.textSecondary,
  },
});
