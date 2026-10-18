import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required fields', 'Please complete all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Password too short', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Type the same new password twice.');
      return;
    }

    setIsUpdating(true);
    const res = await api.changePassword(currentPassword, newPassword);
    setIsUpdating(false);
    if (!res.success) {
      Alert.alert('Not changed', res.error?.message || 'Could not change the password. Try again.');
      return;
    }
    Alert.alert('Password changed', 'Other devices signed in with your old password are now signed out.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Header title="Change Password" subtitle="Security & credentials" showBack backLabel="More" />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Set New Password</Text>
          <Text style={styles.cardDesc}>
            Choose a strong password to protect your establishment panel and doctor schedules.
          </Text>

          {/* Current Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimum 8 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                {showNew ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.requirementsBox}>
            <View style={styles.reqItem}>
              <CheckCircle2
                size={14}
                color={newPassword.length >= 8 ? Colors.success : Colors.textMuted}
              />
              <Text
                style={[
                  styles.reqText,
                  newPassword.length >= 8 && { color: Colors.successText, fontWeight: '600' },
                ]}
              >
                At least 8 characters
              </Text>
            </View>
            <View style={styles.reqItem}>
              <CheckCircle2
                size={14}
                color={
                  newPassword && newPassword === confirmPassword
                    ? Colors.success
                    : Colors.textMuted
                }
              />
              <Text
                style={[
                  styles.reqText,
                  newPassword &&
                    newPassword === confirmPassword && {
                      color: Colors.successText,
                      fontWeight: '600',
                    },
                ]}
              >
                Passwords match
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isUpdating && { opacity: 0.6 }]}
            onPress={handleUpdatePassword}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
  },
  requirementsBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  reqText: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
