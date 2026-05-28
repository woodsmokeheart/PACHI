import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../constants/theme';

interface Props {
  title: string;
  stars: number; // 0 = not done, 1-3 = done
  locked: boolean;
  onPress: () => void;
}

export default function LessonItem({ title, stars, locked, onPress }: Props) {
  const starsDisplay = locked
    ? '🔒'
    : stars > 0
    ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
    : '☆☆☆';

  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => [
        styles.item,
        locked && styles.itemLocked,
        pressed && !locked && styles.itemPressed,
      ]}
    >
      <Text style={[styles.title, locked && styles.textLocked]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.stars}>{starsDisplay}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.paddingLG,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemLocked: {
    backgroundColor: '#F5F5F5',
  },
  itemPressed: {
    opacity: 0.8,
  },
  title: {
    flex: 1,
    fontSize: FONT.sizeSM,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  textLocked: {
    color: COLORS.locked,
  },
  stars: {
    fontSize: 18,
    marginLeft: 8,
  },
});
