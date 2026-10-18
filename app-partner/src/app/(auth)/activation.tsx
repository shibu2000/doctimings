import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound, Mail, Lock, ShieldCheck, User, Phone } from 'lucide-react-native';
import { useAuth } from '../../store/AuthContext';
import { Header } from '../../components/Header';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

const Field = ({
  label,
  icon,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; icon: React.ReactNode }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} {...props} />
    </View>
  </View>
);

export default function AccountActivationScreen() {
  const router = useRouter();
  const { activate } = useAuth();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setError('');
    if (code.replace(/[^A-Za-z0-9]/g, '').length < 10) return setError('Enter the full 10-character code.');
    if (name.trim().length < 2) return setError('Enter your name.');
    if (phone.replace(/\D/g, '').length < 10) return setError('Enter your mobile number.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('The two passwords do not match.');

    setIsLoading(true);
    const result = await activate({ code: code.trim(), name: name.trim(), phone: phone.trim(), email: email.trim(), password });
    setIsLoading(false);
    if (result.success) router.replace('/(tabs)');
    else setError(result.error || 'Could not activate. Check the code and try again.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Header title="Activate with a code" showBack backLabel="Login" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.infoBanner}>
              <ShieldCheck size={20} color={Colors.primary} />
              <Text style={styles.infoBannerText}>
                Enter the one-time code you received from DocTimings or your establishment owner. If you already have a DocTimings Partner login, use the same email and password to add this access to it.
              </Text>
            </View>

            <Field label="Access code" icon={<KeyRound size={18} color={Colors.textSecondary} />} placeholder="e.g. K7Q2M-9XDHA" value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} />
            <Field label="Your name" icon={<User size={18} color={Colors.textSecondary} />} placeholder="Full name" value={name} onChangeText={setName} />
            <Field label="Mobile number" icon={<Phone size={18} color={Colors.textSecondary} />} placeholder="+91" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Email (used to sign in)" icon={<Mail size={18} color={Colors.textSecondary} />} placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Field label="Password" icon={<Lock size={18} color={Colors.textSecondary} />} placeholder="At least 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
            <Field label="Confirm password" icon={<Lock size={18} color={Colors.textSecondary} />} placeholder="Type it again" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleActivate} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Activate and sign in</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
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
  content: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoBannerText: {
    ...Typography.bodySm,
    color: Colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...Typography.labelLg,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successDesc: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  loginBtnText: {
    ...Typography.labelMd,
    color: Colors.textInverse,
    fontWeight: '700',
  },
});
