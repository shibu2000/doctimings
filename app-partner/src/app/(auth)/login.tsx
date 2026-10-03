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
import { Mail, Lock, Eye, EyeOff, Building2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('rakesh@example.com');
  const [password, setPassword] = useState('partner123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your establishment email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await login(email.trim(), password.trim());
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setErrorMessage(result.error || 'Incorrect email or password. Please verify and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Building2 size={24} color={Colors.primary} />
            <Text style={styles.brandTitle}>DocTimings</Text>
          </View>
          <View style={styles.portalTag}>
            <Text style={styles.portalTagText}>PARTNER PORTAL</Text>
          </View>
          <Text style={styles.brandSubtitle}>
            Manage your doctors and real-time clinic schedules on DocTimings.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={Colors.error} />
              <View style={styles.errorTextContainer}>
                <Text style={styles.errorTitle}>Verification Failed</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Establishment Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. rakesh@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="Enter your security password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Sign In to Dashboard</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Invitation notice */}
        <TouchableOpacity
          style={styles.invitationCard}
          onPress={() => router.push('/(auth)/activation')}
          activeOpacity={0.7}
        >
          <View style={styles.invitationIconBox}>
            <ShieldCheck size={20} color={Colors.primary} />
          </View>
          <View style={styles.invitationTextContainer}>
            <Text style={styles.invitationTitle}>Received an invitation?</Text>
            <Text style={styles.invitationDesc}>
              Use the temporary passcode from your DocTimings official partnership letter to activate your panel.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerNote}>Authorized Healthcare Establishments Only</Text>
          <Text style={styles.footerSub}>DocTimings Healthcare Platform • v2.4 Partner Edition</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  brandTitle: {
    ...Typography.h1,
    color: Colors.primary,
    fontWeight: '800',
  },
  portalTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  portalTagText: {
    ...Typography.labelSm,
    color: Colors.primaryDark,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  errorBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    ...Typography.labelMd,
    color: Colors.error,
    fontWeight: '600',
  },
  errorMessage: {
    ...Typography.bodySm,
    color: Colors.error,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  forgotLink: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '600',
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
  inputPassword: {
    paddingRight: Spacing.md,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...Typography.labelLg,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  invitationCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  invitationIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitationTextContainer: {
    flex: 1,
  },
  invitationTitle: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  invitationDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  footerNote: {
    ...Typography.labelSm,
    color: Colors.textMuted,
  },
  footerSub: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
