import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Forgot password" showBack backLabel="Login" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.successIconBox}>
            <KeyRound size={32} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Get a new password</Text>
          <Text style={styles.successDesc}>
            For your safety, passwords are reset by a person, not by email.{'\n\n'}
            • Counter staff: ask your establishment owner to remove you and send a new code, or contact DocTimings.{'\n'}
            • Owners and doctors: contact the DocTimings team. After we confirm it’s you by calling the number on record, we set a temporary password that you can change from More → Change password.
          </Text>
          <TouchableOpacity style={styles.backToLoginButton} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.backToLoginText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
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
