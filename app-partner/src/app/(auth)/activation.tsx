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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound, Mail, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

export default function AccountActivationScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const handleActivate = () => {
    if (!inviteCode.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords entered do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsActivated(true);
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Header title="Account Activation" showBack backLabel="Login" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isActivated ? (
          <View style={styles.card}>
            <View style={styles.successIconBox}>
              <CheckCircle2 size={40} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Account Activated!</Text>
            <Text style={styles.successDesc}>
              Your establishment panel is now active and ready for live chamber coordination. You can sign in using your newly configured credentials.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.loginBtnText}>Proceed to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.infoBanner}>
              <ShieldCheck size={20} color={Colors.primary} />
              <Text style={styles.infoBannerText}>
                Use your official DocTimings partnership onboarding letter to locate your unique invitation code.
              </Text>
            </View>

            {/* Invite Code */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Invitation Code / Passcode</Text>
              <View style={styles.inputContainer}>
                <KeyRound size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. DN-MMC-2026-99"
                  placeholderTextColor={Colors.textMuted}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Official Establishment Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. desk@maamedical.org"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Create Security Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Security Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleActivate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Activate Establishment Panel</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
