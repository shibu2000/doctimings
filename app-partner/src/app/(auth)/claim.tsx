import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Search, ShieldCheck } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { api } from '../../services/api';
import { Doctor } from '../../types';

export default function ClaimProfileScreen() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Doctor[]>([]);
  const [searching, setSearching] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [registration, setRegistration] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (term.trim().length < 3) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await api.searchDirectory(term.trim());
      setSearching(false);
      setResults(res.success && res.data ? res.data : []);
    }, 350);
    return () => clearTimeout(timer);
  }, [term]);

  const pick = (d: Doctor) => {
    setDoctor(d);
    setName(d.fullName);
    setError('');
  };

  const submit = async () => {
    if (!doctor) return;
    setError('');
    if (name.trim().length < 2) return setError('Enter your name.');
    if (phone.replace(/\D/g, '').length < 10) return setError('Enter your mobile number.');
    if (registration.trim().length < 3) return setError('Enter your medical registration number.');
    setSending(true);
    const res = await api.submitClaim(doctor.id, {
      claimantName: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      registrationNumber: registration.trim(),
      message: message.trim() || undefined,
    });
    setSending(false);
    if (res.success) setSent(true);
    else setError(res.error?.message || 'Could not send the request. Try again.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <Header title="Claim your profile" showBack backLabel="Login" />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {sent ? (
            <View style={styles.card}>
              <CheckCircle2 size={40} color={Colors.success} />
              <Text style={styles.title}>Request sent</Text>
              <Text style={styles.body}>
                DocTimings will call the phone number we have on record for {doctor?.fullName} to confirm it’s you. After that you’ll receive a one-time code. Use “Have an access code?” on the sign-in screen to create your login.
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.primaryButtonText}>Back to sign in</Text>
              </TouchableOpacity>
            </View>
          ) : !doctor ? (
            <View style={styles.card}>
              <View style={styles.banner}>
                <ShieldCheck size={18} color={Colors.primary} />
                <Text style={styles.bannerText}>Find your listing first. Only the real doctor can claim a profile. We verify every request by phone.</Text>
              </View>
              <Text style={styles.label}>Your name as listed</Text>
              <View style={styles.inputRow}>
                <Search size={18} color={Colors.textSecondary} />
                <TextInput style={styles.input} value={term} onChangeText={setTerm} placeholder="e.g. Amit Das" placeholderTextColor={Colors.textMuted} autoFocus />
              </View>
              {searching && <ActivityIndicator style={styles.spacer} color={Colors.primary} />}
              {results.map(d => (
                <TouchableOpacity key={d.id} style={styles.result} onPress={() => pick(d)}>
                  <Text style={styles.resultName}>{d.fullName}</Text>
                  <Text style={styles.resultMeta}>{d.specialty}{d.qualifications ? ` · ${d.qualifications}` : ''}</Text>
                </TouchableOpacity>
              ))}
              {!searching && term.trim().length >= 3 && results.length === 0 && (
                <Text style={styles.body}>No listing found. Ask the pharmacy or chamber where you sit to add you first.</Text>
              )}
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.selected}>
                <View style={styles.flex}>
                  <Text style={styles.resultName}>{doctor.fullName}</Text>
                  <Text style={styles.resultMeta}>{doctor.specialty}</Text>
                </View>
                <TouchableOpacity onPress={() => setDoctor(null)}>
                  <Text style={styles.link}>Change</Text>
                </TouchableOpacity>
              </View>
              {[
                { label: 'Your name', value: name, set: setName, props: {} },
                { label: 'Mobile number', value: phone, set: setPhone, props: { keyboardType: 'phone-pad' as const, placeholder: '+91' } },
                { label: 'Email (optional)', value: email, set: setEmail, props: { keyboardType: 'email-address' as const, autoCapitalize: 'none' as const } },
                { label: 'Medical registration number', value: registration, set: setRegistration, props: { autoCapitalize: 'characters' as const, placeholder: 'e.g. WBMC-57842' } },
              ].map(f => (
                <View key={f.label}>
                  <Text style={styles.label}>{f.label}</Text>
                  <TextInput style={[styles.inputRow, styles.input]} value={f.value} onChangeText={f.set} placeholderTextColor={Colors.textMuted} {...f.props} />
                </View>
              ))}
              <Text style={styles.label}>Anything we should know (optional)</Text>
              <TextInput style={[styles.inputRow, styles.input, styles.multiline]} value={message} onChangeText={setMessage} multiline maxLength={1000} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.primaryButton, sending && styles.disabled]} onPress={submit} disabled={sending}>
                {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Send request</Text>}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.lg },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.sm },
  banner: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  bannerText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, minHeight: 48, backgroundColor: Colors.surface },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  multiline: { minHeight: 90, paddingTop: Spacing.md, textAlignVertical: 'top' },
  spacer: { marginTop: Spacing.md },
  result: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  resultName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  resultMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  selected: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md },
  link: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  error: { color: Colors.error, fontSize: 13, marginTop: Spacing.sm },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: Radius.lg, minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
