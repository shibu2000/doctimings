import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, CalendarOff, ChevronDown, DoorOpen, Plus, Stethoscope, Undo2, Users } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { api } from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { usePartner } from '../../store/PartnerContext';
import { TemporaryOverride } from '../../types';
import { addDaysIso, dayNameOf, formatDayLabel, formatTime12, todayInIndia } from '../../utils/date';

interface TodaySession {
  key: string;
  doctorId: string;
  doctorName: string;
  start: string;
  end: string;
  status: 'scheduled' | 'away' | 'changed' | 'extra';
  override?: TemporaryOverride;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentEstablishment,
    establishments,
    rosterDoctors,
    schedules,
    overrides,
    isDoctor,
    canManagePeople,
    setEstablishment,
    refreshOverrides,
    refreshSchedules,
    refreshDoctors,
  } = usePartner();
  const [switching, setSwitching] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const today = todayInIndia();
  const dayName = dayNameOf(today);
  const names = useMemo(() => new Map(rosterDoctors.map(d => [d.id, d.fullName])), [rosterDoctors]);

  const sessions = useMemo<TodaySession[]>(() => {
    const todays = overrides.filter(o => o.establishmentId === currentEstablishment?.id && o.overrideDate === today);
    const list: TodaySession[] = [];
    for (const s of schedules.filter(x => x.isActive && x.dayOfWeek === dayName)) {
      const own = todays.filter(o => o.doctorId === s.doctorId);
      const away = own.find(o => o.overrideType === 'unavailable');
      const changed = own.find(o => o.overrideType === 'changed' && o.startTime && o.endTime);
      const base = { doctorId: s.doctorId, doctorName: names.get(s.doctorId) ?? s.doctorName ?? 'Doctor' };
      if (away) list.push({ ...base, key: `${s.id}-away`, start: s.startTime, end: s.endTime, status: 'away', override: away });
      else if (changed) list.push({ ...base, key: `${s.id}-changed`, start: changed.startTime!, end: changed.endTime!, status: 'changed', override: changed });
      else list.push({ ...base, key: s.id, start: s.startTime, end: s.endTime, status: 'scheduled' });
    }
    for (const o of todays.filter(x => x.overrideType === 'additional' && x.startTime && x.endTime)) {
      list.push({ key: o.id, doctorId: o.doctorId, doctorName: names.get(o.doctorId) ?? o.doctorName ?? 'Doctor', start: o.startTime!, end: o.endTime!, status: 'extra', override: o });
    }
    return list.sort((a, b) => a.start.localeCompare(b.start));
  }, [schedules, overrides, names, dayName, today, currentEstablishment?.id]);

  const upcoming = useMemo(
    () =>
      overrides
        .filter(o => o.overrideDate > today && o.overrideDate <= addDaysIso(today, 7))
        .sort((a, b) => a.overrideDate.localeCompare(b.overrideDate)),
    [overrides, today]
  );

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshOverrides(), refreshSchedules(), refreshDoctors()]);
    setRefreshing(false);
  };

  const markAway = (session: TodaySession) =>
    Alert.alert(`${session.doctorName} not available today?`, 'Patients will see that this session is cancelled.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark not available',
        style: 'destructive',
        onPress: async () => {
          if (!currentEstablishment) return;
          setBusy(session.key);
          const res = await api.createOverride({
            doctorId: session.doctorId,
            establishmentId: currentEstablishment.id,
            overrideDate: today,
            overrideType: 'unavailable',
            note: 'Not available today',
          });
          setBusy(null);
          if (!res.success) Alert.alert('Not saved', res.error?.message || 'Please try again.');
          refreshOverrides();
        },
      },
    ]);

  const undo = async (key: string, override: TemporaryOverride) => {
    setBusy(key);
    const res = await api.deleteOverride(override.id);
    setBusy(null);
    if (!res.success) Alert.alert('Not saved', res.error?.message || 'Please try again.');
    refreshOverrides();
  };

  if (!currentEstablishment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.body}>
            {isDoctor ? 'Your profile is not linked to any place yet. Ask the pharmacy or chamber where you sit to add you.' : 'No establishment is linked to this account yet.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const actions = [
    { label: 'Doctors', icon: Stethoscope, onPress: () => router.push('/(tabs)/doctors'), show: !isDoctor },
    { label: 'Add doctor', icon: Plus, onPress: () => router.push('/doctor/add'), show: !isDoctor },
    { label: 'Rooms', icon: DoorOpen, onPress: () => router.push('/practice-locations'), show: !isDoctor },
    { label: 'Team', icon: Users, onPress: () => router.push('/team'), show: canManagePeople },
    { label: 'My timing', icon: CalendarOff, onPress: () => rosterDoctors[0] && router.push(`/doctor/${rosterDoctors[0].id}`), show: isDoctor },
  ].filter(a => a.show);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <Text style={styles.greeting}>Good day{user?.name ? `, ${user.name.replace(/^dr\.?\s*/i, '').split(' ')[0]}` : ''}</Text>
        <TouchableOpacity
          style={styles.placeRow}
          disabled={establishments.length < 2}
          onPress={() => setSwitching(true)}
          accessibilityLabel="Switch establishment"
        >
          <Building2 size={18} color={Colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.placeName}>{currentEstablishment.name}</Text>
            <Text style={styles.meta}>{[currentEstablishment.subDistrict, currentEstablishment.district].filter(Boolean).join(', ')}</Text>
          </View>
          {establishments.length > 1 && <ChevronDown size={18} color={Colors.textSecondary} />}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isDoctor ? 'Your sessions here today' : 'Today'} · {dayName}</Text>
          {sessions.length === 0 ? (
            <Text style={styles.body}>No sessions today.</Text>
          ) : (
            sessions.map(s => (
              <View key={s.key} style={styles.sessionRow}>
                <View style={styles.flex}>
                  <Text style={[styles.time, s.status === 'away' && styles.struck]}>
                    {formatTime12(s.start)} – {formatTime12(s.end)}
                  </Text>
                  {!isDoctor && <Text style={styles.doctor}>{s.doctorName}</Text>}
                  {s.status === 'away' && <Text style={styles.away}>Not available · {s.override?.note}</Text>}
                  {s.status === 'changed' && <Text style={styles.changed}>Changed hours today</Text>}
                  {s.status === 'extra' && <Text style={styles.changed}>Extra session</Text>}
                </View>
                {busy === s.key ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : s.override ? (
                  <TouchableOpacity style={styles.smallButton} onPress={() => undo(s.key, s.override!)}>
                    <Undo2 size={14} color={Colors.textPrimary} />
                    <Text style={styles.smallButtonText}>Undo</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.smallButton} onPress={() => markAway(s)}>
                    <CalendarOff size={14} color={Colors.error} />
                    <Text style={styles.smallButtonText}>Not available</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map(a => (
              <TouchableOpacity key={a.label} style={styles.action} onPress={a.onPress}>
                <a.icon size={20} color={Colors.primary} />
                <Text style={styles.actionText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming up this week</Text>
          {upcoming.length === 0 ? (
            <Text style={styles.body}>No changes planned. Regular timing applies.</Text>
          ) : (
            upcoming.map(o => (
              <View key={o.id} style={styles.sessionRow}>
                <View style={styles.flex}>
                  <Text style={styles.time}>{formatDayLabel(o.overrideDate, today)}</Text>
                  <Text style={styles.doctor}>{names.get(o.doctorId) ?? o.doctorName}</Text>
                  <Text style={o.overrideType === 'unavailable' ? styles.away : styles.changed}>
                    {o.overrideType === 'unavailable'
                      ? `Not available · ${o.note}`
                      : `${o.overrideType === 'additional' ? 'Extra session' : 'Changed hours'} ${o.startTime && o.endTime ? `${formatTime12(o.startTime)} – ${formatTime12(o.endTime)}` : ''}`}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={switching} transparent animationType="slide" onRequestClose={() => setSwitching(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.cardTitle}>Switch establishment</Text>
            {establishments.map(e => (
              <TouchableOpacity
                key={e.id}
                style={styles.sheetRow}
                onPress={() => {
                  setEstablishment(e);
                  setSwitching(false);
                }}
              >
                <Text style={[styles.placeName, e.id === currentEstablishment.id && { color: Colors.primary }]}>{e.name}</Text>
                <Text style={styles.meta}>{e.memberRole === 'Owner' ? 'Owner' : e.memberRole === 'Staff' ? 'Counter staff' : ''}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetRow} onPress={() => setSwitching(false)}>
              <Text style={styles.meta}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  flex: { flex: 1 },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  placeName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  time: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  struck: { textDecorationLine: 'line-through', color: Colors.textMuted },
  doctor: { fontSize: 14, color: Colors.textPrimary, marginTop: 2 },
  away: { fontSize: 13, color: Colors.error, marginTop: 2 },
  changed: { fontSize: 13, color: Colors.warningText, marginTop: 2 },
  smallButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, minHeight: 40 },
  smallButtonText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  action: { flexGrow: 1, flexBasis: '45%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, minHeight: 52 },
  actionText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.xs },
  sheetRow: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
});
