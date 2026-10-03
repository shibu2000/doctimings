import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  Users,
  FileText,
  ExternalLink,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { usePartner } from '../../store/PartnerContext';
import { StatusBadge } from '../../components/StatusBadge';

export default function EstablishmentProfileScreen() {
  const router = useRouter();
  const { currentEstablishment, practiceLocations, rosterDoctors } = usePartner();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Establishment</Text>
          <Text style={styles.subtitle}>Manage the facility profile patients see on DocTimings.</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 1. Header Card */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.logoBox}>
              <Building2 size={32} color={Colors.primary} />
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>MMC</Text>
              </View>
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.badgeRow}>
                <StatusBadge status="active" />
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{currentEstablishment?.type || 'Clinic'}</Text>
                </View>
                <StatusBadge status="verified" />
              </View>
              <Text style={styles.estName}>{currentEstablishment?.name || 'Maa Medical Centre'}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={Colors.primary} />
                <Text style={styles.locationText}>
                  {currentEstablishment?.subDistrict || 'Gopiballavpur'}, {currentEstablishment?.district || 'Jhargram'}
                </Text>
              </View>
            </View>
          </View>

          {/* Visibility strip */}
          <View style={styles.visibilityStrip}>
            <View style={styles.visibilityLeft}>
              <View style={styles.pulseDot} />
              <Text style={styles.visibilityText}>Publicly Listed on DocTimings Civic Discover</Text>
            </View>
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => Alert.alert('Patient View', 'This listing is discoverable by patients within 25 km of Gopiballavpur.')}
            >
              <Text style={styles.previewBtnText}>Preview</Text>
              <ExternalLink size={12} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Verification & Information Status */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.verifIconRow}>
              <ShieldCheck size={20} color={Colors.success} />
              <Text style={styles.cardSectionTitle}>Information Status</Text>
            </View>
            <StatusBadge status="verified" />
          </View>
          <Text style={styles.cardDesc}>
            Your public listing is up-to-date and fully discoverable by nearby patients in Gopiballavpur rural subdivisions.
          </Text>
          <View style={styles.infoAlert}>
            <Text style={styles.infoAlertText}>
              Legal ownership or license updates require DocTimings verification review before publishing.
            </Text>
          </View>
        </View>

        {/* 3. Facility Attributes */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Facility Attributes</Text>

          {/* Address */}
          <View style={styles.attrRow}>
            <MapPin size={18} color={Colors.primary} style={styles.attrIcon} />
            <View style={styles.attrContent}>
              <Text style={styles.attrLabel}>Physical Location</Text>
              <Text style={styles.attrValue}>
                {currentEstablishment?.address || 'Station Road, Gopiballavpur, Jhargram, West Bengal — 721506'}
              </Text>
              <Text style={styles.attrSub}>Near Gopiballavpur Bazaar Junction</Text>
            </View>
          </View>

          {/* Operational Hours */}
          <View style={styles.attrRow}>
            <Clock size={18} color={Colors.primary} style={styles.attrIcon} />
            <View style={styles.attrContent}>
              <Text style={styles.attrLabel}>Reception & Counter Hours</Text>
              <Text style={styles.attrValue}>Monday – Saturday: 9:00 AM – 8:00 PM</Text>
              <Text style={styles.attrSub}>Sunday Closed (Emergency OPD by doctor roster)</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.attrRow}>
            <Phone size={18} color={Colors.primary} style={styles.attrIcon} />
            <View style={styles.attrContent}>
              <Text style={styles.attrLabel}>Front Desk Helpdesk</Text>
              <Text style={styles.attrValue}>{currentEstablishment?.phone || '+91 98765 43210'}</Text>
            </View>
          </View>

          {/* License */}
          <View style={styles.attrRow}>
            <FileText size={18} color={Colors.primary} style={styles.attrIcon} />
            <View style={styles.attrContent}>
              <Text style={styles.attrLabel}>Clinical License & Proprietor</Text>
              <Text style={styles.attrValue}>
                {currentEstablishment?.licenseNumber || 'WB-DL-JHR-2021-9981'}
              </Text>
              <Text style={styles.attrSub}>
                Proprietor: {currentEstablishment?.proprietorName || 'Rakesh Das'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Quick Nav: Practice Locations (Rooms) */}
        <TouchableOpacity
          style={styles.navRowCard}
          onPress={() => router.push('/practice-locations')}
          activeOpacity={0.7}
        >
          <View style={styles.navRowLeft}>
            <View style={styles.navIconBox}>
              <DoorOpen size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.navRowTitle}>Practice Locations & Rooms</Text>
              <Text style={styles.navRowDesc}>
                {practiceLocations.length > 0 ? `${practiceLocations.length} consultation chambers configured` : 'Chamber 1 (Ground Floor), Chamber 2'}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* 5. Quick Nav: Counter Team */}
        <TouchableOpacity
          style={styles.navRowCard}
          onPress={() => router.push('/team')}
          activeOpacity={0.7}
        >
          <View style={styles.navRowLeft}>
            <View style={styles.navIconBox}>
              <Users size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.navRowTitle}>Counter Team & Staff</Text>
              <Text style={styles.navRowDesc}>
                Manage receptionist desks & staff access
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>
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
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
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
    gap: Spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  logoBadgeText: {
    ...Typography.labelSm,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  identityDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  typeBadgeText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  estName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  visibilityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  visibilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  visibilityText: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewBtnText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardSectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  infoAlert: {
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  infoAlertText: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  attrIcon: {
    marginTop: 2,
  },
  attrContent: {
    flex: 1,
  },
  attrLabel: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    fontSize: 11,
  },
  attrValue: {
    ...Typography.bodyMd,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  attrSub: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  navRowCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  navIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRowTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  navRowDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
