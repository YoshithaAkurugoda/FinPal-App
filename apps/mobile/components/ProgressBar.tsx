import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@/constants/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

function getAutoColor(progress: number): string {
  if (progress < 0.6) return theme.colors.success;
  if (progress < 0.85) return theme.colors.warning;
  return theme.colors.danger;
}

export default function ProgressBar({
  progress,
  color,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const barColor = color ?? getAutoColor(clamped);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clamped,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: barColor,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
