import React, { useState, useEffect } from 'react';
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
  Search as SearchIcon,
  X,
  MapPin,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { DoctorCard } from '../../components/common/DoctorCard';
import { RadiusSelector } from '../../components/common/RadiusSelector';
import { DOCTORS } from '../../data/mockData';
import { Colors } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { Doctor } from '../../types';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ q?: string; specialty?: string }>();
  const { currentLocation, searchRadius, setSearchRadius, language } = useApp();

  const [query, setQuery] = useState<string>(params.q || params.specialty || '');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState<boolean>(false);
  const [showRadiusFilter, setShowRadiusFilter] = useState<boolean>(false);

  useEffect(() => {
    if (params.q) {
      setQuery(params.q);
    } else if (params.specialty) {
      setQuery(params.specialty);
    }
  }, [params.q, params.specialty]);

  const normalizeQuery = (text: string) => {
    const lower = text.toLowerCase().trim();
    if (lower.includes('skin') || lower.includes('rash') || lower.includes('চামড়া') || lower.includes('চর্ম')) {
      return 'dermatolog';
    }
    if (lower.includes('child') || lower.includes('baby') || lower.includes('বাচ্চা') || lower.includes('শিশু')) {
      return 'pediatric';
    }
    if (lower.includes('eye') || lower.includes('vision') || lower.includes('চোখ')) {
      return 'ophthalmolog';
    }
    if (lower.includes('stomach') || lower.includes('gastric') || lower.includes('পেট') || lower.includes('হজম')) {
      return 'gastro';
    }
    if (lower.includes('bone') || lower.includes('joint') || lower.includes('হাড়') || lower.includes('বাত')) {
      return 'orthoped';
    }
    if (lower.includes('tooth') || lower.includes('teeth') || lower.includes('dental') || lower.includes('দাঁত')) {
      return 'dental';
    }
    if (lower.includes('women') || lower.includes('period') || lower.includes('মহিলা') || lower.includes('স্ত্রী')) {
      return 'gynecolog';
    }
    return lower;
  };

  const normalized = normalizeQuery(query);

  const matchedDoctors: Doctor[] = DOCTORS.filter((doctor) => {
    const matchesDistance = doctor.practices.some(
      (p) => (p.distanceKm || 0) <= searchRadius
    );
    if (!matchesDistance) return false;

    if (onlyAvailableToday && doctor.todayAvailability !== 'available_today') {
      return false;
    }

    if (!normalized) return true;

    const nameMatch = doctor.name.toLowerCase().includes(normalized);
    const specialtyMatch = doctor.specialties.some((s) =>
      s.toLowerCase().includes(normalized)
    );
    const specialtyBnMatch = doctor.specialtiesBn.some((s) =>
      s.toLowerCase().includes(normalized)
    );
    const establishmentMatch = doctor.practices.some((p) =>
      p.establishmentName.toLowerCase().includes(normalized)
    );

    return nameMatch || specialtyMatch || specialtyBnMatch || establishmentMatch;
  });

  const locationName = language === 'bn' ? currentLocation.nameBn : currentLocation.name;

  const handleExpandRadius = () => {
    const nextRadius = searchRadius >= 50 ? 50 : searchRadius >= 25 ? 50 : 25;
    setSearchRadius(nextRadius);
  };

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
          <SearchIcon size={18} color={Colors.primary} strokeWidth={2.2} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlPill, showRadiusFilter && styles.controlPillActive]}
            activeOpacity={0.7}
            onPress={() => setShowRadiusFilter(!showRadiusFilter)}
          >
            <SlidersHorizontal size={13} color={showRadiusFilter ? Colors.primaryDark : Colors.textSecondary} />
            <Text style={[styles.controlPillText, showRadiusFilter && styles.controlPillTextActive]}>
              {t('search.withinRadius', { radius: searchRadius })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlPill, onlyAvailableToday && styles.controlPillActive]}
            activeOpacity={0.7}
            onPress={() => setOnlyAvailableToday(!onlyAvailableToday)}
          >
            <CheckCircle2
              size={13}
              color={onlyAvailableToday ? Colors.primaryDark : Colors.success}
            />
            <Text style={[styles.controlPillText, onlyAvailableToday && styles.controlPillTextActive]}>
              {t('search.availableTodayOnly')}
            </Text>
          </TouchableOpacity>
        </View>

        {showRadiusFilter && (
          <View style={styles.radiusContainer}>
            <RadiusSelector
              currentRadius={searchRadius}
              onSelectRadius={(r) => {
                setSearchRadius(r);
                setShowRadiusFilter(false);
              }}
            />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {t('search.foundCount', { count: matchedDoctors.length })}
          </Text>
          <View style={styles.locationBadge}>
            <MapPin size={12} color={Colors.primaryDark} />
            <Text style={styles.locationBadgeText}>{locationName}</Text>
          </View>
        </View>

        {matchedDoctors.length > 0 ? (
          <View style={styles.doctorList}>
            {matchedDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Compass size={36} color={Colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>{t('search.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('search.emptySubtitle', { location: locationName })}
            </Text>

            <View style={styles.emptyAdviceCard}>
              <Text style={styles.emptyAdviceText}>{t('search.emptyAdvice')}</Text>
            </View>

            {searchRadius < 50 && (
              <TouchableOpacity
                style={styles.expandButton}
                activeOpacity={0.8}
                onPress={handleExpandRadius}
              >
                <Text style={styles.expandButtonText}>
                  {t('search.expandRadius', { radius: searchRadius >= 25 ? 50 : 25 })}
                </Text>
                <ArrowRight size={16} color={Colors.textInverse} />
              </TouchableOpacity>
            )}

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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  searchBoxWrapper: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  controlPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  controlPillTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  radiusContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
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
    color: Colors.textPrimary,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  locationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  doctorList: {
    paddingHorizontal: 16,
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
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAdviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginTop: 16,
    width: '100%',
  },
  emptyAdviceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 18,
    width: '100%',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  suggestionsSection: {
    marginTop: 24,
    width: '100%',
  },
  suggestionsHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionChipText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
});
