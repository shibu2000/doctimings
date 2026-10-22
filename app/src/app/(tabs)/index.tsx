import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
  Clock,
  CheckCircle2,
  Navigation,
  Mic,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { DoctorList } from '../../components/common/DoctorList';
import { LocationNotice } from '../../components/common/LocationNotice';
import { CategoryChip } from '../../components/common/CategoryChip';
import { useDoctorSearch } from '../../hooks/useDoctors';
import { useApp } from '../../store/AppContext';
import { GlowingIcon } from '../../components/common/GlowingIcon';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLocation, language, theme, isDark, locationStatus } = useApp();
  const nearby = useDoctorSearch('');

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'evening' | 'nearest'>('all');

  const categories = language === 'bn'
    ? [
        { id: 'cat-stomach', label: 'গ্যাস্ট্রিক ও পেট ব্যথা', query: 'Stomach pain' },
        { id: 'cat-skin', label: 'চর্ম ও চুলকানি', query: 'Skin doctor' },
        { id: 'cat-child', label: 'বাচ্চাদের ডাক্তার', query: 'Child doctor' },
        { id: 'cat-bone', label: 'হাড় ও জয়েন্টের ব্যথা', query: 'Bone & Joint' },
        { id: 'cat-women', label: 'মহিলা ও প্রসূতি রোগ', query: "Women's Health" },
        { id: 'cat-eye', label: 'চোখের ডাক্তার', query: 'Eye doctor' },
        { id: 'cat-dental', label: 'দাঁতের ডাক্তার', query: 'Dental' },
        { id: 'cat-general', label: 'সাধারণ মেডিসিন', query: 'General doctor' },
      ]
    : [
        { id: 'cat-stomach', label: t('categories.stomach'), query: 'Stomach pain' },
        { id: 'cat-skin', label: t('categories.skin'), query: 'Skin doctor' },
        { id: 'cat-child', label: t('categories.child'), query: 'Child doctor' },
        { id: 'cat-bone', label: t('categories.bone'), query: 'Bone & Joint' },
        { id: 'cat-women', label: t('categories.women'), query: "Women's Health" },
        { id: 'cat-eye', label: t('categories.eye'), query: 'Eye doctor' },
        { id: 'cat-dental', label: t('categories.dental'), query: 'Dental' },
        { id: 'cat-general', label: t('categories.general'), query: 'General doctor' },
      ];

  const handleCategoryPress = (query: string) => {
    router.push({
      pathname: '/(tabs)/search',
      params: { q: query },
    });
  };

  const filteredDoctors = (nearby.data?.doctors ?? []).filter((doctor) => {
    if (activeFilter === 'today') {
      return doctor.todayAvailability === 'available_today';
    }
    if (activeFilter === 'evening') {
      return doctor.practices.some((p) =>
        p.schedules.some((s) => s.startTime >= '16:00')
      );
    }
    if (activeFilter === 'nearest') {
      return doctor.practices.some((p) => (p.distanceKm ?? 99) < 5);
    }
    return true;
  });

  const locationName = language === 'bn' ? currentLocation.nameBn : currentLocation.name;
  const loadingNearby = locationStatus === 'detecting' || (!nearby.data && nearby.isFetching);
  const showNearby = !loadingNearby && !(nearby.isError && !nearby.data);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.surface }]}
      edges={['top']}
    >
      <Header />
      <DoctorList
        hasMore={Boolean(nearby.hasNextPage)}
        loadingMore={nearby.isFetchingNextPage}
        onLoadMore={() => nearby.fetchNextPage()}
        doctors={showNearby ? filteredDoctors : []}
        town={nearby.data?.town ?? null}
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        header={
          <>
            <View
              style={[
                styles.heroSection,
                {
                  backgroundColor: theme.surface,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
                {t('home.lookingForDoctor')}
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                {t('home.heroSubtitle')}
              </Text>

              <TouchableOpacity
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: isDark
                      ? theme.surfaceVariant
                      : theme.background,
                    borderColor: theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Search size={18} color={theme.primary} strokeWidth={2.2} />
                <Text
                  style={[styles.searchPlaceholder, { color: theme.textSecondary }]}
                >
                  {t('home.searchPlaceholder')}
                </Text>
                <GlowingIcon glowColor={theme.glowPrimary} size={28} pulse={false}>
                  <View
                    style={[
                      styles.micCircle,
                      { backgroundColor: theme.primaryLight },
                    ]}
                  >
                    <Mic size={14} color={theme.primaryDark} strokeWidth={2.5} />
                  </View>
                </GlowingIcon>
              </TouchableOpacity>

              <View style={styles.hintRow}>
                <Sparkles size={13} color={theme.warning} />
                <Text style={[styles.hintText, { color: theme.textMuted }]}>
                  {t('home.searchHints')}
                </Text>
              </View>
            </View>

            <View style={styles.categoriesSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesTrack}
              >
                {categories.map((cat) => (
                  <CategoryChip
                    key={cat.id}
                    label={cat.label}
                    onPress={() => handleCategoryPress(cat.query)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  {t('home.doctorsNearYou')}
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  {t('home.showingChambers')} {locationName}
                </Text>
              </View>
            </View>

            <View style={styles.filterTrack}>
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      activeFilter === 'all' ? theme.primaryLight : theme.surface,
                    borderColor:
                      activeFilter === 'all' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter('all')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color:
                        activeFilter === 'all'
                          ? theme.primaryDark
                          : theme.textPrimary,
                      fontWeight: activeFilter === 'all' ? '700' : '500',
                    },
                  ]}
                >
                  {t('search.allSittings')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      activeFilter === 'today' ? theme.primaryLight : theme.surface,
                    borderColor:
                      activeFilter === 'today' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter('today')}
              >
                <CheckCircle2
                  size={12}
                  color={activeFilter === 'today' ? theme.primaryDark : theme.success}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color:
                        activeFilter === 'today'
                          ? theme.primaryDark
                          : theme.textPrimary,
                      fontWeight: activeFilter === 'today' ? '700' : '500',
                    },
                  ]}
                >
                  {t('search.availableTodayOnly')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      activeFilter === 'evening' ? theme.primaryLight : theme.surface,
                    borderColor:
                      activeFilter === 'evening' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter('evening')}
              >
                <Clock
                  size={12}
                  color={
                    activeFilter === 'evening'
                      ? theme.primaryDark
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color:
                        activeFilter === 'evening'
                          ? theme.primaryDark
                          : theme.textPrimary,
                      fontWeight: activeFilter === 'evening' ? '700' : '500',
                    },
                  ]}
                >
                  {t('search.eveningSittings')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      activeFilter === 'nearest' ? theme.primaryLight : theme.surface,
                    borderColor:
                      activeFilter === 'nearest' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter('nearest')}
              >
                <Navigation
                  size={12}
                  color={
                    activeFilter === 'nearest'
                      ? theme.primaryDark
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color:
                        activeFilter === 'nearest'
                          ? theme.primaryDark
                          : theme.textPrimary,
                      fontWeight: activeFilter === 'nearest' ? '700' : '500',
                    },
                  ]}
                >
                  {t('search.withinFiveKm')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.doctorList}>
              <LocationNotice />
              {loadingNearby ? (
                <View style={styles.listState}>
                  <ActivityIndicator color={theme.primary} />
                  <Text style={[styles.listStateText, { color: theme.textSecondary }]}>
                    {locationStatus === 'detecting' ? t('location.detecting') : t('common.loading')}
                  </Text>
                </View>
              ) : !showNearby ? (
                <TouchableOpacity style={styles.listState} onPress={() => nearby.refetch()}>
                  <Text style={[styles.listStateText, { color: theme.textSecondary }]}>{t('search.loadFailed')}</Text>
                  <Text style={[styles.listStateText, { color: theme.primary, fontWeight: '700' }]}>{t('common.retry')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        }
        empty={
          showNearby ? (
            <View style={styles.listState}>
              <Text style={[styles.listStateText, { color: theme.textSecondary }]}>{t('search.emptyTitle')}</Text>
            </View>
          ) : null
        }
        footer={
          <>

            <TouchableOpacity
              style={[
                styles.guideBanner,
                {
                  backgroundColor: isDark
                    ? theme.surfaceVariant
                    : theme.primaryLight,
                  borderColor: theme.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/guide')}
            >
              <View
                style={[
                  styles.guideIcon,
                  { backgroundColor: isDark ? theme.surface : '#FFFFFF' },
                ]}
              >
                <BookOpen size={20} color={theme.primary} />
              </View>
              <View style={styles.guideContent}>
                <Text style={[styles.guideTitle, { color: theme.primaryDark }]}>
                  {t('home.exploreGuide')}
                </Text>
                <Text
                  style={[styles.guideSubtitle, { color: theme.textSecondary }]}
                >
                  {t('home.exploreGuideSubtitle')}
                </Text>
              </View>
              <ArrowRight size={18} color={theme.primary} />
            </TouchableOpacity>

            <View
              style={[
                styles.disclaimerBox,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Info size={15} color={theme.primary} />
              <View style={styles.disclaimerContent}>
                <Text
                  style={[styles.disclaimerTitle, { color: theme.textPrimary }]}
                >
                  {t('common.disclaimerTitle')}
                </Text>
                <Text
                  style={[styles.disclaimerBody, { color: theme.textSecondary }]}
                >
                  {t('common.disclaimerBody')}
                </Text>
              </View>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  listStateText: {
    fontSize: 13,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 3,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
  },
  micCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 11,
  },
  categoriesSection: {
    paddingVertical: 12,
  },
  categoriesTrack: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  filterTrack: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  doctorList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  guideBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  guideIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  guideSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  disclaimerBox: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  disclaimerBody: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
