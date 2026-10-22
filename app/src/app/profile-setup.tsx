import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { X, UserRound, Lock } from 'lucide-react-native';
import { useApp } from '../store/AppContext';

const normalizePhone = (value: string) => value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, saveProfile, skipProfile, theme } = useApp();
  const isEdit = Boolean(profile);

  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [submitted, setSubmitted] = useState(false);

  const trimmedName = name.trim().replace(/\s+/g, ' ');
  const digits = normalizePhone(phone);
  const nameInvalid = trimmedName.length < 2;
  const phoneInvalid = digits.length > 0 && !/^[6-9]\d{9}$/.test(digits);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const handleSave = async () => {
    setSubmitted(true);
    if (nameInvalid || phoneInvalid) return;
    await saveProfile({ name: trimmedName, phone: digits });
    close();
  };

  const handleDismiss = async () => {
    if (!isEdit) await skipProfile();
    close();
  };

  const inputStyle = (invalid: boolean) => [
    styles.input,
    {
      backgroundColor: theme.surface,
      borderColor: submitted && invalid ? theme.error : theme.border,
      color: theme.textPrimary,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surface }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {isEdit ? t('profile.editTitle') : t('profile.setupTitle')}
        </Text>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={handleDismiss} hitSlop={10}>
          <X size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={[styles.flex, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroBox}>
            <View style={[styles.heroIcon, { backgroundColor: theme.primaryLight }]}>
              <UserRound size={28} color={theme.primary} />
            </View>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              {t('profile.setupSubtitle')}
            </Text>
          </View>

          <Text style={[styles.label, { color: theme.textPrimary }]}>{t('profile.nameLabel')}</Text>
          <TextInput
            style={inputStyle(nameInvalid)}
            value={name}
            onChangeText={setName}
            placeholder={t('profile.namePlaceholder')}
            placeholderTextColor={theme.textMuted}
            autoCapitalize="words"
            autoComplete="name"
            maxLength={60}
            returnKeyType="next"
          />
          {submitted && nameInvalid && (
            <Text style={[styles.errorText, { color: theme.error }]}>{t('profile.nameError')}</Text>
          )}

          <Text style={[styles.label, { color: theme.textPrimary }]}>{t('profile.phoneLabel')}</Text>
          <TextInput
            style={inputStyle(phoneInvalid)}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('profile.phonePlaceholder')}
            placeholderTextColor={theme.textMuted}
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={16}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {submitted && phoneInvalid && (
            <Text style={[styles.errorText, { color: theme.error }]}>{t('profile.phoneError')}</Text>
          )}

          <View style={[styles.privacyRow, { backgroundColor: theme.primaryLight }]}>
            <Lock size={14} color={theme.primaryDark} />
            <Text style={[styles.privacyText, { color: theme.primaryDark }]}>{t('profile.deviceOnly')}</Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            <Text style={[styles.primaryBtnText, { color: theme.textInverse }]}>{t('profile.save')}</Text>
          </TouchableOpacity>
          {!isEdit && (
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7} onPress={handleDismiss}>
              <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>{t('profile.skip')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 19,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    gap: 4,
    borderTopWidth: 1,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
