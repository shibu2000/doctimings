import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface GlowingIconProps {
  children: React.ReactNode;
  glowColor: string;
  size?: number;
  pulse?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const GlowingIcon: React.FC<GlowingIconProps> = ({
  children,
  glowColor,
  size = 32,
  pulse = true,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse, pulseAnim]);

  const haloScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const haloOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.65],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {pulse && (
        <Animated.View
          style={[
            styles.halo,
            {
              backgroundColor: glowColor,
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
          ]}
        />
      )}
      <View style={[styles.inner, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  halo: {
    position: 'absolute',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
