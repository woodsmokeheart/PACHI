import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { SIZES } from '../constants/theme';

interface Props {
  stars: number; // 1, 2, or 3
  animate?: boolean;
  size?: number;
}

export default function StarRating({ stars, animate = false, size = 40 }: Props) {
  const anims = [
    useRef(new Animated.Value(animate ? 0 : 1)).current,
    useRef(new Animated.Value(animate ? 0 : 1)).current,
    useRef(new Animated.Value(animate ? 0 : 1)).current,
  ];

  useEffect(() => {
    if (!animate) return;
    Animated.stagger(
      200,
      anims.slice(0, stars).map((a) =>
        Animated.spring(a, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        })
      )
    ).start();
  }, [stars, animate]);

  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <Animated.Text
          key={i}
          style={[
            { fontSize: size },
            {
              transform: [{ scale: anims[i] }],
              opacity: anims[i],
            },
          ]}
        >
          {i < stars ? '⭐' : '☆'}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.padding,
  },
});
