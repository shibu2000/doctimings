import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import { BrandLogo } from './BrandLogo';
import { LightColors as Colors } from '../../constants/theme';
import { useApp } from '../../store/AppContext';

const MIN_VISIBLE_MS = 1200;
const FADE_MS = 300;

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const SplashOverlay: React.FC = () => {
  const { t } = useTranslation();
  const { isReady } = useApp();
  const [minElapsed, setMinElapsed] = useState(false);
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [pulse]);

  useEffect(() => {
    if (!isReady || !minElapsed) return;
    Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => setVisible(false));
  }, [isReady, minElapsed, opacity]);

  if (!visible) return null;

  const dotOpacity = (offset: number) =>
    pulse.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0, 1, 2, 3].map((step) => (((step + offset) % 3) === 0 ? 1 : 0.3)),
    });

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={isReady && minElapsed ? 'none' : 'auto'}
      onLayout={() => SplashScreen.hideAsync().catch(() => undefined)}
    >
      <View style={styles.centerBox}>
        <View style={styles.logoWrapper}>
          <View style={[styles.bgCard, styles.bgCardBack]} />
          <View style={[styles.bgCard, styles.bgCardMid]} />
          <View style={styles.logoCard}>
            <BrandLogo size={64} />
          </View>
        </View>

        <Text style={styles.title}>{t('common.appName')}</Text>
        <Text style={styles.subtitle}>{t('common.tagline')}</Text>

        <View style={styles.loaderRow}>
          {[0, 2, 1].map((offset) => (
            <Animated.View key={offset} style={[styles.dot, { opacity: dotOpacity(offset) }]} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.communityRow}>
          <ShieldCheck size={14} color={Colors.primary} />
          <Text style={styles.communityText}>{t('common.verifiedDirectory')}</Text>
        </View>
        <Text style={styles.versionText}>v{Constants.expoConfig?.version}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
    elevation: 100,
  },
  centerBox: {
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  logoWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bgCard: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  bgCardBack: {
    opacity: 0.6,
    transform: [{ rotate: '-6deg' }],
  },
  bgCardMid: {
    opacity: 0.9,
    transform: [{ rotate: '4deg' }],
  },
  logoCard: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },
  loaderRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 4,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  versionText: {
    fontSize: 11,
    color: Colors.statusUnknown,
  },
});
