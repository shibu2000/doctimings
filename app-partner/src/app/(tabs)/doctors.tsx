import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Plus,
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { usePartner } from '../../store/PartnerContext';
import { StatusBadge } from '../../components/StatusBadge';

const SPECIALTIES = [
  'All',
  'General Medicine',
  'Dermatology',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
];

export default function DoctorsListScreen() {
  const router = useRouter();
  const { rosterDoctors, refreshDoctors, currentEstablishment, isDoctor } = usePartner();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDoctors();
    setRefreshing(false);
  };

  const filteredDoctors = useMemo(() => {
    return rosterDoctors.filter((doc) => {
      const matchesSearch =
        doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.qualifications.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [rosterDoctors, searchQuery, selectedSpecialty]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Doctors Roster</Text>
            <Text style={styles.subtitle}>
              {currentEstablishment?.name} · {rosterDoctors.length} Affiliated
            </Text>
          </View>
          {!isDoctor && (
          <TouchableOpacity
            style={styles.addDoctorBtn}
            onPress={() => router.push('/doctor/add')}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addDoctorBtnText}>Add Doctor</Text>
          </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors by name or specialty..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Specialty Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec;
            return (
              <TouchableOpacity
                key={spec}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedSpecialty(spec)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {spec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Doctor Cards List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {filteredDoctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Stethoscope size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No doctors found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? `No doctors match "${searchQuery}". Try a different keyword.`
                : 'No doctors affiliated with this facility yet. Add your first doctor now.'}
            </Text>
            {!isDoctor && (
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/doctor/add')}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>Add Doctor to Roster</Text>
            </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredDoctors.map((doc, idx) => (
            <TouchableOpacity
              key={doc.id || idx}
              style={styles.doctorCard}
              onPress={() => router.push(`/doctor/${doc.id}`)}
              activeOpacity={0.7}
            >
              {/* Top Details */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>
                    {doc.fullName.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.doctorDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.doctorName} numberOfLines={1}>
                      {doc.fullName}
                    </Text>
                  </View>
                  <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                  <Text style={styles.doctorQualifications} numberOfLines={1}>
                    {doc.qualifications} · {doc.experienceYears} yrs exp.
                  </Text>
                </View>
                <StatusBadge status={idx === 0 ? 'available_today' : 'scheduled_today'} />
              </View>

              {/* Roster & Slot details */}
              <View style={styles.slotDetailsBox}>
                <View style={styles.slotDetailRow}>
                  <Clock size={14} color={Colors.primary} />
                  <Text style={styles.slotDetailText}>
                    Thu & Fri · 5:00 PM – 7:00 PM (Regular Weekly Slots)
                  </Text>
                </View>
                <View style={styles.slotDetailRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.slotDetailText}>
                    Chamber 1 · Ground Floor (Room MMC-01)
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => router.push(`/doctor/schedule/${doc.id}`)}
                >
                  <Calendar size={14} color={Colors.primary} />
                  <Text style={styles.secondaryActionText}>Weekly Slots</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => router.push(`/doctor/overrides/${doc.id}`)}
                >
                  <Clock size={14} color={Colors.warningText} />
                  <Text style={[styles.secondaryActionText, { color: Colors.warningText }]}>
                    Temporary Changes
                  </Text>
                </TouchableOpacity>

                <View style={styles.cardArrow}>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addDoctorBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  addDoctorBtnText: {
    ...Typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
  },
  filterScroll: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  filterChipSelected: {
    backgroundColor: Colors.primaryLight,
  },
  filterChipText: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  doctorCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.labelLg,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  doctorDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  doctorName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    ...Typography.labelMd,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  doctorQualifications: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  slotDetailsBox: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: 6,
  },
  slotDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  slotDetailText: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  secondaryActionText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardArrow: {
    marginLeft: 'auto',
  },
  emptyState: {
    backgroundColor: Colors.surface,
    padding: Spacing.xxl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptyDesc: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  emptyAddBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  emptyAddBtnText: {
    ...Typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
