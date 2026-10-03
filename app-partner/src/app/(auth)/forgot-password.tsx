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
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    // Simulate reset request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Header title="Reset Password" showBack backLabel="Login" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isSubmitted ? (
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <CheckCircle2 size={36} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Instructions Sent</Text>
            <Text style={styles.successDesc}>
              We have dispatched password reset instructions to{' '}
              <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>{email}</Text>. Please follow the link in your email to reset your credentials.
            </Text>
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Find Your Establishment Account</Text>
            <Text style={styles.cardDesc}>
              Enter the registered email associated with your clinic or pharmacy counter desk.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Registered Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. partner@maamedical.org"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (!email.trim() || isLoading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!email.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Reset Instructions</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
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
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...Typography.labelLg,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  successDesc: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  backToLoginButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  backToLoginText: {
    ...Typography.labelMd,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
});
