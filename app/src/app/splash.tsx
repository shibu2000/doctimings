import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, ArrowRight } from 'lucide-react-native';
import { BrandLogo } from '../components/common/BrandLogo';
import { Colors } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2400);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.syncBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.syncText}>Online Sync</Text>
          </View>
        </View>

        <View style={styles.centerBox}>
          <View style={styles.logoWrapper}>
            <View style={[styles.bgCard, styles.bgCardBack]} />
            <View style={[styles.bgCard, styles.bgCardMid]} />
            <View style={styles.logoCard}>
              <BrandLogo size={64} />
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>DocTimings</Text>
            <Text style={styles.subtitle}>
              Find doctors near you, right on time.
            </Text>
          </View>

          <View style={styles.loaderRow}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.8}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.continueBtnText}>Explore Directory</Text>
            <ArrowRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.communityRow}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.communityText}>Community-Verified Timings</Text>
          </View>
          <Text style={styles.versionText}>
            Verified Local Healthcare Discovery • v2.4
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerBox: {
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  logoWrapper: {
    position: 'relative',
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
  },
  bgCardBack: {
    backgroundColor: Colors.primaryLight,
    opacity: 0.6,
    transform: [{ rotate: '-6deg' }],
  },
  bgCardMid: {
    backgroundColor: Colors.primaryLight,
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
  titleSection: {
    alignItems: 'center',
    gap: 6,
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
  },
  loaderRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 20,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  dot1: {
    opacity: 0.9,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.3,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  continueBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 8,
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
