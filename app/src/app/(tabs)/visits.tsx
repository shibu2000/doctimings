import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Building2,
  Phone,
  Trash2,
  Plus,
  Info,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { useApp } from '../../store/AppContext';
import { MyVisit } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { GlowingIcon } from '../../components/common/GlowingIcon';

export default function VisitsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { visits, cancelVisit, theme, isDark } = useApp();

  const [cancelModal, setCancelModal] = useState<{
    visible: boolean;
    visit: MyVisit | null;
  }>({
    visible: false,
    visit: null,
  });

  const activeVisits = visits.filter((v) => v.status === 'planned');
  const pastVisits = visits.filter((v) => v.status !== 'planned');

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
    }
  };

  const handleCancelPress = (visit: MyVisit) => {
    setCancelModal({
      visible: true,
      visit,
    });
  };

  const handleConfirmCancel = async () => {
    if (cancelModal.visit) {
      await cancelVisit(cancelModal.visit.id);
    }
    setCancelModal({ visible: false, visit: null });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.surface }]}
      edges={['top']}
    >
      <Header />
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.topHeader,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {t('visits.title')}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {t('visits.subtitle')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
              onPress={() => router.push('/plan-visit')}
            >
              <Plus size={16} color={theme.textInverse} strokeWidth={2.5} />
              <Text style={[styles.addButtonText, { color: theme.textInverse }]}>
                {t('visits.planNewVisit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {activeVisits.length > 0 ? (
            <View style={styles.section}>
              <Text
                style={[styles.sectionHeader, { color: theme.textSecondary }]}
              >
                {t('visits.upcomingVisits')}
              </Text>
              {activeVisits.map((visit) => (
                <View
                  key={visit.id}
                  style={[
                    styles.visitCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.avatarMini,
                        {
                          backgroundColor: isDark
                            ? theme.surfaceVariant
                            : theme.primaryLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarMiniText,
                          {
                            color: isDark ? theme.primary : theme.primaryDark,
                          },
                        ]}
                      >
                        {visit.doctorName.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text
                        style={[styles.doctorName, { color: theme.textPrimary }]}
                      >
                        {visit.doctorName}
                      </Text>
                      <Text style={[styles.specialty, { color: theme.primary }]}>
                        {visit.doctorSpecialty}
                      </Text>
                    </View>
                    <GlowingIcon glowColor={theme.glowPrimary} size={28} pulse>
                      <View
                        style={[
                          styles.activePill,
                          { backgroundColor: theme.primaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.activePillText,
                            { color: theme.primaryDark },
                          ]}
                        >
                          {t('visits.statusPlanned')}
                        </Text>
                      </View>
                    </GlowingIcon>
                  </View>

                  <View
                    style={[
                      styles.detailsBox,
                      {
                        backgroundColor: isDark
                          ? theme.surfaceVariant
                          : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.detailRow}>
                      <Calendar size={13} color={theme.primary} />
                      <Text
                        style={[styles.detailText, { color: theme.textPrimary }]}
                      >
                        {t('visits.visitDate', { date: visit.visitDate })}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Clock size={13} color={theme.primary} />
                      <Text
                        style={[styles.detailText, { color: theme.textPrimary }]}
                      >
                        {visit.visitTime}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Building2 size={13} color={theme.textSecondary} />
                      <Text
                        style={[
                          styles.detailText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {visit.establishmentName} · {visit.establishmentAddress}
                      </Text>
                    </View>

                    {visit.notes && (
                      <View style={styles.notesRow}>
                        <Info size={12} color={theme.textMuted} />
                        <Text
                          style={[styles.notesText, { color: theme.textMuted }]}
                        >
                          {visit.notes}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionCall,
                        { backgroundColor: theme.primary },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleCall(visit.establishmentPhone)}
                    >
                      <Phone size={13} color={theme.textInverse} />
                      <Text
                        style={[
                          styles.actionCallText,
                          { color: theme.textInverse },
                        ]}
                      >
                        {t('common.call')} ({visit.establishmentPhone})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionCancel,
                        {
                          backgroundColor: isDark
                            ? theme.surfaceVariant
                            : theme.errorLight,
                          borderColor: isDark ? theme.border : theme.error,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleCancelPress(visit)}
                    >
                      <Trash2 size={13} color={theme.error} />
                      <Text
                        style={[
                          styles.actionCancelText,
                          { color: theme.error },
                        ]}
                      >
                        {t('visits.cancelReminder')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <GlowingIcon glowColor={theme.glowPrimary} size={64} pulse>
                <View
                  style={[
                    styles.emptyIcon,
                    {
                      backgroundColor: isDark
                        ? theme.surfaceVariant
                        : theme.primaryLight,
                    },
                  ]}
                >
                  <CalendarCheck size={32} color={theme.primary} />
                </View>
              </GlowingIcon>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                {t('visits.emptyTitle')}
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.textSecondary }]}
              >
                {t('visits.emptySubtitle')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyPlanBtn,
                  { backgroundColor: theme.primary },
                ]}
                activeOpacity={0.8}
                onPress={() => router.push('/plan-visit')}
              >
                <Plus size={16} color={theme.textInverse} strokeWidth={2.5} />
                <Text
                  style={[
                    styles.emptyPlanBtnText,
                    { color: theme.textInverse },
                  ]}
                >
                  {t('visits.planNewVisit')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {pastVisits.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionHeader, { color: theme.textSecondary }]}
              >
                {t('visits.pastVisits')}
              </Text>
              {pastVisits.map((visit) => (
                <View
                  key={visit.id}
                  style={[
                    styles.pastCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.pastCardHeader}>
                    <Text
                      style={[
                        styles.pastDoctorName,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {visit.doctorName}
                    </Text>
                    <Text
                      style={[
                        styles.pastSpecialty,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {visit.doctorSpecialty}
                    </Text>
                  </View>
                  <Text
                    style={[styles.pastDate, { color: theme.textMuted }]}
                  >
                    {visit.visitDate} · {visit.establishmentName}
                  </Text>
                  <Text
                    style={[
                      styles.pastStatus,
                      {
                        color:
                          visit.status === 'cancelled'
                            ? theme.error
                            : theme.textMuted,
                      },
                    ]}
                  >
                    {visit.status === 'cancelled'
                      ? t('visits.statusCancelled')
                      : t('visits.statusCompleted')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={cancelModal.visible}
        title={t('visits.cancelReminder')}
        message={`Are you sure you want to cancel your reminder for ${cancelModal.visit?.doctorName || ''}?`}
        variant="danger"
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModal({ visible: false, visit: null })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  visitCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  specialty: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detailsBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#CBD5E1',
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  actionCall: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionCallText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionCancel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionCancelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  emptyPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyPlanBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pastCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    opacity: 0.8,
  },
  pastCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastDoctorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pastSpecialty: {
    fontSize: 12,
  },
  pastDate: {
    fontSize: 11,
    marginTop: 4,
  },
  pastStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
