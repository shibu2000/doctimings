import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  X,
  Send,
  HeartHandshake,
} from 'lucide-react-native';
import { DOCTORS } from '../data/mockData';
import { ReportIssueType } from '../types';
import { useApp } from '../store/AppContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export default function ReportIssueScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark, submitReport } = useApp();
  const params = useLocalSearchParams<{ doctorId?: string; establishmentId?: string }>();

  const doctor = DOCTORS.find((d) => d.id === params.doctorId) || DOCTORS[0];

  const [selectedType, setSelectedType] = useState<ReportIssueType>('doctor_not_arrived');
  const [message, setMessage] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const issueTypes: { type: ReportIssueType; label: string }[] = [
    { type: 'doctor_not_arrived', label: t('report.types.doctor_not_arrived') },
    { type: 'no_longer_visits', label: t('report.types.no_longer_visits') },
    { type: 'schedule_changed', label: t('report.types.schedule_changed') },
    { type: 'wrong_phone', label: t('report.types.wrong_phone') },
    { type: 'incorrect_fee', label: t('report.types.incorrect_fee') },
    { type: 'other', label: t('report.types.other') },
  ];

  const handleSubmit = async () => {
    try {
      await submitReport({
        doctorId: doctor?.id,
        establishmentId: params.establishmentId,
        issueType: selectedType === 'doctor_not_arrived' ? 'doc_unavailable' : selectedType === 'schedule_changed' ? 'sched_change' : selectedType === 'no_longer_visits' ? 'no_longer_practices' : 'other',
        issueTitle: `Discrepancy report for ${doctor?.displayName || 'Doctor'}`,
        description: message.trim() || `Report regarding ${selectedType}`,
        reporterPhone: phone.trim() || undefined
      });
    } catch {}
    setSuccessModalVisible(true);
  };

  const handleModalDone = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.surface }]}
      edges={['top', 'bottom']}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('report.title')}
        </Text>
        <TouchableOpacity
          style={styles.closeBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <X size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroBanner,
            {
              backgroundColor: isDark
                ? theme.surfaceVariant
                : theme.primaryLight,
              borderColor: theme.border,
            },
          ]}
        >
          <HeartHandshake size={20} color={theme.primary} />
          <View style={styles.heroBannerContent}>
            <Text
              style={[styles.heroBannerTitle, { color: theme.primaryDark }]}
            >
              Community Verified Health Network
            </Text>
            <Text
              style={[styles.heroBannerBody, { color: theme.textSecondary }]}
            >
              {t('report.subtitle')}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.targetCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.targetLabel, { color: theme.textMuted }]}>
            Reporting info for:
          </Text>
          <Text style={[styles.targetDoctor, { color: theme.textPrimary }]}>
            {doctor.name}
          </Text>
          <Text style={[styles.targetChamber, { color: theme.textSecondary }]}>
            {doctor.practices[0]?.establishmentName}, {doctor.practices[0]?.locality}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('report.issueType')}
          </Text>
          <View style={styles.typesList}>
            {issueTypes.map((item) => {
              const isSelected = selectedType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: isSelected
                        ? theme.primaryLight
                        : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedType(item.type)}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioDot,
                          { backgroundColor: theme.primary },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color: isSelected
                          ? theme.primaryDark
                          : theme.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('report.messageLabel')}
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder={t('report.messagePlaceholder')}
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('report.phoneLabel')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98324 00000"
            placeholderTextColor={theme.textMuted}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
          onPress={handleSubmit}
        >
          <Send size={16} color={theme.textInverse} />
          <Text style={[styles.submitBtnText, { color: theme.textInverse }]}>
            {t('report.submitCta')}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={successModalVisible}
        title={t('report.title')}
        message={t('report.thankYou')}
        variant="success"
        singleAction
        confirmText={t('common.done')}
        onConfirm={handleModalDone}
        onCancel={handleModalDone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroBannerContent: {
    flex: 1,
  },
  heroBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroBannerBody: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  targetCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetDoctor: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  targetChamber: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  typesList: {
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 13,
    flex: 1,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
