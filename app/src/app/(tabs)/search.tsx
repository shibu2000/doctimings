import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Search as SearchIcon,
  X,
  MapPin,
  Compass,
  CheckCircle2,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { DoctorList } from '../../components/common/DoctorList';
import { LocationNotice } from '../../components/common/LocationNotice';
import { useDoctorSearch } from '../../hooks/useDoctors';
import { ThemeColors } from '../../constants/theme';
import { useApp } from '../../store/AppContext';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ q?: string; specialty?: string }>();
  const { currentLocation, language, theme } = useApp();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [query, setQuery] = useState<string>(params.q || params.specialty || '');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState<boolean>(false);

  useEffect(() => {
    if (params.q) {
      setQuery(params.q);
    } else if (params.specialty) {
      setQuery(params.specialty);
    }
  }, [params.q, params.specialty]);

  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = useDoctorSearch(debounced, onlyAvailableToday);
  const matchedDoctors = search.data?.doctors ?? [];
  const isLoading = !search.data && (search.isPending || search.isFetching);
  const showResults = !isLoading && !(search.isError && !search.data);

  const locationName = language === 'bn' ? currentLocation.nameBn : currentLocation.name;

  const quickSuggestions = [
    { label: t('categories.skin'), value: 'Skin doctor' },
    { label: t('categories.child'), value: 'Child doctor' },
    { label: t('categories.eye'), value: 'Eye doctor' },
    { label: t('categories.general'), value: 'General doctor' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />
      <View style={styles.searchBoxWrapper}>
        <View style={styles.inputContainer}>
          <SearchIcon size={18} color={theme.primary} strokeWidth={2.2} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlPill, onlyAvailableToday && styles.controlPillActive]}
            activeOpacity={0.7}
            onPress={() => setOnlyAvailableToday(!onlyAvailableToday)}
          >
            <CheckCircle2
              size={13}
              color={onlyAvailableToday ? theme.primaryDark : theme.success}
            />
            <Text style={[styles.controlPillText, onlyAvailableToday && styles.controlPillTextActive]}>
              {t('search.availableTodayOnly')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <DoctorList
        hasMore={Boolean(search.hasNextPage)}
        loadingMore={search.isFetchingNextPage}
        onLoadMore={() => search.fetchNextPage()}
        doctors={showResults ? matchedDoctors : []}
        town={search.data?.town ?? null}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        header={
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {isLoading ? t('common.loading') : t('search.foundCount', { count: search.data?.total ?? 0 })}
              </Text>
              <View style={styles.locationBadge}>
                <MapPin size={12} color={theme.primaryDark} />
                <Text style={styles.locationBadgeText}>{locationName}</Text>
              </View>
            </View>
            <View style={styles.noticeWrap}>
              <LocationNotice />
            </View>
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : !showResults ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>{t('search.loadFailed')}</Text>
                <TouchableOpacity style={styles.expandButton} activeOpacity={0.8} onPress={() => search.refetch()}>
                  <Text style={styles.expandButtonText}>{t('common.retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        }
        empty={
          showResults ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Compass size={36} color={theme.primary} strokeWidth={1.8} />
              </View>
              <Text style={styles.emptyTitle}>{t('search.emptyTitle')}</Text>
              <Text style={styles.emptySubtitle}>
                {t('search.emptySubtitle')}
              </Text>

              <View style={styles.emptyAdviceCard}>
                <Text style={styles.emptyAdviceText}>{t('search.emptyAdvice')}</Text>
              </View>

              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsHeader}>{t('search.tryCategories')}</Text>
                <View style={styles.suggestionsGrid}>
                  {quickSuggestions.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionChip}
                      onPress={() => setQuery(item.value)}
                    >
                      <Text style={styles.suggestionChipText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
  loadingBox: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  searchBoxWrapper: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.textPrimary,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  controlPillActive: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  controlPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  controlPillTextActive: {
    color: theme.primaryDark,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  noticeWrap: {
    paddingHorizontal: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  locationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primaryDark,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAdviceCard: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    marginTop: 16,
    width: '100%',
  },
  emptyAdviceText: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 18,
    width: '100%',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textInverse,
  },
  suggestionsSection: {
    marginTop: 24,
    width: '100%',
  },
  suggestionsHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  suggestionChipText: {
    fontSize: 12,
    color: theme.primaryDark,
    fontWeight: '600',
  },
});
