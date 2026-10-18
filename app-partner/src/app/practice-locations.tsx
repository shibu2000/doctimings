import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  DoorOpen,
  Plus,
  X,
  CheckCircle2,
  Info,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBadge } from '../components/StatusBadge';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { usePartner } from '../store/PartnerContext';
import { api } from '../services/api';

export default function PracticeLocationsScreen() {
  const { currentEstablishment, practiceLocations, refreshLocations } = usePartner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesignation, setRoomDesignation] = useState('');
  const [floor, setFloor] = useState('Ground Floor');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRoom = async () => {
    if (!roomName.trim() || !roomDesignation.trim()) {
      Alert.alert('Required Fields', 'Please enter room name and designation.');
      return;
    }

    if (!currentEstablishment) return;

    setIsSaving(true);
    try {
      const res = await api.addPracticeLocation(currentEstablishment.id, {
        name: roomName.trim(),
        roomDesignation: roomDesignation.trim(),
        floor,
      });

      if (res.success) {
        Alert.alert('Room Added', `${roomName} is now ready for doctor assignments.`);
        await refreshLocations();
        setRoomName('');
        setRoomDesignation('');
        setIsModalOpen(false);
      } else {
        Alert.alert('Not saved', res.error?.message || 'Please try again.');
      }
    } catch {
      Alert.alert('Not saved', 'No internet connection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Practice Locations"
        subtitle="Manage rooms & chambers"
        showBack
        backLabel="Establishment"
        rightAction={
          <TouchableOpacity
            style={styles.addBtnHeader}
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnHeaderText}>Add Room</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Facility Context Card */}
        <View style={styles.contextCard}>
          <View style={styles.contextHeader}>
            <Text style={styles.estName}>{currentEstablishment?.name}</Text>
            <StatusBadge status="active" label="Operational" />
          </View>
          <Text style={styles.contextDesc}>
            Manage the physical rooms and cabins where your establishment hosts specialist chambers and patient consultations.
          </Text>
        </View>

        {/* Architecture explainer */}
        <View style={styles.explainerCard}>
          <View style={styles.explainerHeader}>
            <Info size={18} color={Colors.primary} />
            <Text style={styles.explainerTitle}>Chamber Architecture</Text>
          </View>
          <Text style={styles.explainerText}>
            Each room has an independent designation. Doctors can be scheduled across multiple chambers without room collision.
          </Text>
        </View>

        {/* Rooms List Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>CONFIGURED CONSULTING ROOMS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{practiceLocations.length}</Text>
          </View>
        </View>

        {practiceLocations.map((loc, idx) => (
          <View key={loc.id || idx} style={styles.roomCard}>
            <View style={styles.roomCardTop}>
              <View style={styles.roomIconBox}>
                <DoorOpen size={20} color={Colors.primary} />
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{loc.name}</Text>
                <Text style={styles.roomDesignation}>{loc.roomDesignation}</Text>
              </View>
              <StatusBadge status="active" />
            </View>

            <View style={styles.roomFooter}>
              <Text style={styles.floorText}>Floor: {loc.floor || 'Ground Floor'}</Text>
              <Text style={styles.roomStatusText}>Live Chamber Ready</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Room Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Practice Room / Cabin</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Register a new consultation cabin or examination room in {currentEstablishment?.name}.
            </Text>

            <Text style={styles.inputLabel}>Room Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Chamber 3"
              placeholderTextColor={Colors.textMuted}
              value={roomName}
              onChangeText={setRoomName}
            />

            <Text style={styles.inputLabel}>Room Designation (Visible to Patients)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Chamber 3 · Ground Floor (OPD Cabin)"
              placeholderTextColor={Colors.textMuted}
              value={roomDesignation}
              onChangeText={setRoomDesignation}
            />

            <Text style={styles.inputLabel}>Floor Level</Text>
            <View style={styles.floorChipsRow}>
              {['Ground Floor', '1st Floor', '2nd Floor'].map((fl) => (
                <TouchableOpacity
                  key={fl}
                  style={[
                    styles.floorChip,
                    floor === fl && styles.floorChipSelected,
                  ]}
                  onPress={() => setFloor(fl)}
                >
                  <Text
                    style={[
                      styles.floorChipText,
                      floor === fl && styles.floorChipTextSelected,
                    ]}
                  >
                    {fl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveRoomBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleAddRoom}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveRoomBtnText}>Save Room Configuration</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addBtnHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  addBtnHeaderText: {
    ...Typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  contextCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  estName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  contextDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  explainerCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: 4,
  },
  explainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  explainerTitle: {
    ...Typography.labelMd,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  explainerText: {
    ...Typography.bodySm,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  countBadgeText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  roomCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  roomCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  roomIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  roomDesignation: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  floorText: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
  },
  roomStatusText: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  modalSub: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  floorChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  floorChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  floorChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  floorChipText: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
  },
  floorChipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  saveRoomBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  saveRoomBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
