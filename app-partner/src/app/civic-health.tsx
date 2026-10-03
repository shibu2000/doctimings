import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  HeartPulse,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { usePartner } from '../store/PartnerContext';

export default function CivicHealthScreen() {
  const { currentEstablishment } = usePartner();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Civic Health Network"
        subtitle="Regional healthcare directory"
        showBack
        backLabel="More"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner Card */}
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <HeartPulse size={24} color={Colors.primary} />
          </View>
          <Text style={styles.cardTitle}>DocTimings Civic Health Directory</Text>
          <Text style={styles.cardDesc}>
            Connecting local private chambers, rural pharmacies, and regional public hospitals into a unified, transparent healthcare directory.
          </Text>
        </View>

        {/* Your Civic Node */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>YOUR CIVIC NODE</Text>
          <View style={styles.nodeBox}>
            <Building2 size={20} color={Colors.primary} />
            <View style={styles.nodeInfo}>
              <Text style={styles.nodeTitle}>{currentEstablishment?.name || 'Maa Medical Centre'}</Text>
              <Text style={styles.nodeSub}>
                Verified Healthcare Node · {currentEstablishment?.subDistrict || 'Gopiballavpur'}, {currentEstablishment?.district || 'Jhargram'}
              </Text>
            </View>
          </View>
          <Text style={styles.nodeNote}>
            Your active doctor roster is synchronized to the regional civic search index, ensuring nearby villagers find genuine consultation hours.
          </Text>
        </View>

        {/* Regional Emergency Civic Contacts */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>REGIONAL CIVIC NODES (JHARGRAM)</Text>

          <View style={styles.civicRow}>
            <Building2 size={18} color={Colors.textSecondary} />
            <View style={styles.civicInfo}>
              <Text style={styles.civicTitle}>Gopiballavpur Sub-Divisional Hospital</Text>
              <Text style={styles.civicAddress}>Gopiballavpur-I Block · 24x7 Emergency</Text>
              <Text style={styles.civicPhone}>+91 3221 266 200</Text>
            </View>
          </View>

          <View style={styles.civicRow}>
            <Building2 size={18} color={Colors.textSecondary} />
            <View style={styles.civicInfo}>
              <Text style={styles.civicTitle}>Jhargram District Hospital & Blood Bank</Text>
              <Text style={styles.civicAddress}>Jhargram Sadar · Emergency Trauma Care</Text>
              <Text style={styles.civicPhone}>+91 3221 255 224</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  cardDesc: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 4,
  },
  nodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  nodeInfo: {
    flex: 1,
  },
  nodeTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  nodeSub: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  nodeNote: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  civicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  civicInfo: {
    flex: 1,
  },
  civicTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  civicAddress: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  civicPhone: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});
