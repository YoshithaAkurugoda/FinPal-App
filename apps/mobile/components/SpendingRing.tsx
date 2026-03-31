import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@/constants/theme';

interface SpendingRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

function getRingColor(progress: number): string {
  if (progress < 0.6) return theme.colors.success;
  if (progress < 0.85) return theme.colors.warning;
  return theme.colors.danger;
}

export default function SpendingRing({
  progress,
  size = 120,
  strokeWidth = 10,
}: SpendingRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped);
  const color = getRingColor(clamped);
  const percentage = Math.round(clamped * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
        <Text style={styles.label}>spent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentage: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
