import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound, Share2, UserMinus, UserPlus, XCircle } from 'lucide-react-native';
import { Header } from '../components/Header';
import { Colors, Radius, Spacing } from '../constants/theme';
import { api } from '../services/api';
import { usePartner } from '../store/PartnerContext';
import { CreatedInvite, TeamView } from '../types';

const formatDay = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function TeamScreen() {
  const { currentEstablishment, canManagePeople } = usePartner();
  const [team, setTeam] = useState<TeamView | null>(null);
  const [error, setError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [created, setCreated] = useState<CreatedInvite | null>(null);

  const load = useCallback(async () => {
    if (!currentEstablishment || !canManagePeople) return;
    const res = await api.getTeam(currentEstablishment.id);
    if (res.success && res.data) {
      setTeam(res.data);
      setError('');
    } else {
      setError(res.error?.message || 'Could not load the team.');
    }
  }, [currentEstablishment, canManagePeople]);

  useEffect(() => {
    load();
  }, [load]);

  if (!currentEstablishment) return null;

  if (!canManagePeople) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header title="Counter team" showBack backLabel="More" />
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.body}>Only the owner of {currentEstablishment.name} can add or remove counter staff.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const sendInvite = async () => {
    if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Missing details', 'Enter the person’s name and mobile number.');
      return;
    }
    setSending(true);
    const res = await api.inviteStaff(currentEstablishment.id, { name: name.trim(), phone: phone.trim() });
    setSending(false);
    if (!res.success || !res.data) {
      Alert.alert('Not sent', res.error?.message || 'Could not create the code.');
      return;
    }
    setName('');
    setPhone('');
    setCreated(res.data);
    load();
  };

  const shareCode = (invite: CreatedInvite) =>
    Share.share({
      message: `Your DocTimings Partner code for ${currentEstablishment.name} is ${invite.code}. Open the DocTimings Partner app, tap "Have an access code?" and enter it. It works once and expires on ${formatDay(invite.invitation.expiresAt)}.`,
    });

  const confirmRemove = (memberId: string, memberName: string) =>
    Alert.alert(`Remove ${memberName}?`, 'They will be signed out of this establishment straight away.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const res = await api.removeMember(currentEstablishment.id, memberId);
          if (!res.success) Alert.alert('Not removed', res.error?.message || 'Try again.');
          load();
        },
      },
    ]);

  const cancelInvite = async (id: string) => {
    const res = await api.cancelInvite(id);
    if (!res.success) Alert.alert('Not cancelled', res.error?.message || 'Try again.');
    load();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Counter team" subtitle={currentEstablishment.name} showBack backLabel="More" />
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!team && !error && <ActivityIndicator color={Colors.primary} />}
        {team && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>People with access</Text>
            {team.members.map(m => (
              <View key={m.id} style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.name}>
                    {m.name} <Text style={styles.role}>· {m.role === 'Owner' ? 'Owner' : 'Counter staff'}</Text>
                  </Text>
                  <Text style={styles.meta}>{m.phone} · {m.email}</Text>
                </View>
                {m.role === 'Staff' && (
                  <TouchableOpacity onPress={() => confirmRemove(m.id, m.name)} hitSlop={10} accessibilityLabel={`Remove ${m.name}`}>
                    <UserMinus size={20} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {team.invitations.map(i => (
              <View key={i.id} style={[styles.row, styles.pending]}>
                <View style={styles.flex}>
                  <Text style={styles.name}>{i.name}</Text>
                  <Text style={styles.meta}>Code not used yet · expires {formatDay(i.expiresAt)}</Text>
                </View>
                <TouchableOpacity onPress={() => cancelInvite(i.id)} hitSlop={10} accessibilityLabel="Cancel code">
                  <XCircle size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.primaryButton} onPress={() => setInviting(true)}>
          <UserPlus size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Add counter staff</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Counter staff can update doctors, timing and leave. Only you can add or remove people.</Text>
      </ScrollView>

      <Modal
        visible={inviting}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setInviting(false);
          setCreated(null);
        }}
      >
        <View style={styles.overlay}>
          {created ? (
            <View style={styles.sheet}>
              <KeyRound size={28} color={Colors.primary} />
              <Text style={styles.sheetTitle}>Code for {created.invitation.name}</Text>
              <Text style={styles.code} selectable>{created.code}</Text>
              <Text style={styles.body}>Works once and expires on {formatDay(created.invitation.expiresAt)}. This is the only time it is shown.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => shareCode(created)}>
                <Share2 size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Send by WhatsApp / SMS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setInviting(false);
                  setCreated(null);
                }}
              >
                <Text style={styles.secondaryButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Add counter staff</Text>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.textMuted} />
              <Text style={styles.label}>Mobile number</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91" placeholderTextColor={Colors.textMuted} />
              <TouchableOpacity style={[styles.primaryButton, sending && styles.disabled]} onPress={sendInvite} disabled={sending}>
                {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Create code</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setInviting(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  flex: { flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  pending: { backgroundColor: Colors.warningLight, borderRadius: Radius.lg, paddingHorizontal: Spacing.md },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  role: { fontWeight: '400', color: Colors.textSecondary },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  hint: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  error: { color: Colors.error, fontSize: 14 },
  primaryButton: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.lg, minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.sm },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, minHeight: 48, fontSize: 15, color: Colors.textPrimary },
  code: { fontSize: 30, fontWeight: '800', letterSpacing: 4, color: Colors.primary, textAlign: 'center', marginVertical: Spacing.md },
});
