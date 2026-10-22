import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  X,
  MapPin,
  Crosshair,
  Search,
  Check,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Store,
  Building2,
} from 'lucide-react-native';
import { locationFromCoords, detectCoords } from '../services/location';
import { ThemeColors } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { LocationItem } from '../types';

export default function LocationSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLocation, setCurrentLocation, language, towns, locationStatus, theme } = useApp();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedLoc, setSelectedLoc] = useState<LocationItem>(currentLocation);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [systemState, setSystemState] = useState<'default' | 'denied' | 'gps-off'>(
    locationStatus === 'denied' ? 'denied' : locationStatus === 'off' ? 'gps-off' : 'default'
  );

  const filteredLocations = towns.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(term) ||
      loc.nameBn.includes(term) ||
      loc.district.toLowerCase().includes(term) ||
      loc.districtBn.includes(term) ||
      loc.pincode.includes(term)
    );
  });

  const handleUseGPS = async () => {
    setIsDetecting(true);
    const result = await detectCoords();
    setIsDetecting(false);
    if (!result.ok) {
      setSystemState(result.reason === 'denied' ? 'denied' : 'gps-off');
      return;
    }
    setSelectedLoc(locationFromCoords(towns, result.latitude, result.longitude));
    setSystemState('default');
  };

  const handleConfirmLocation = () => {
    setCurrentLocation(selectedLoc);
    router.back();
  };

  const displayName = language === 'bn' ? selectedLoc.nameBn : selectedLoc.name;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.sheetHandle}>
        <View style={styles.handleBar} />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('location.title')}</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <X size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.introText}>{t('location.intro')}</Text>

        <TouchableOpacity
          style={styles.gpsCard}
          activeOpacity={0.8}
          onPress={handleUseGPS}
          disabled={isDetecting}
        >
          <View style={styles.gpsLeft}>
            <View style={styles.gpsIconCircle}>
              {isDetecting ? (
                <ActivityIndicator size="small" color={theme.surface} />
              ) : (
                <Crosshair size={22} color={theme.surface} />
              )}
            </View>
            <View style={styles.gpsTextCol}>
              <View style={styles.gpsTitleRow}>
                <Text style={styles.gpsTitle}>{t('location.useCurrentLocation')}</Text>
                <View style={styles.liveDot} />
              </View>
              <Text style={styles.gpsSubtitle}>
                {t('location.gpsSubtitle')}
              </Text>
            </View>
          </View>
          <View style={styles.detectBadge}>
            <Text style={styles.detectBadgeText}>{t('location.detect')}</Text>
          </View>
        </TouchableOpacity>

        {systemState === 'denied' && (
          <View style={styles.fallbackBox}>
            <AlertTriangle size={20} color={theme.warning} />
            <View style={styles.fallbackContent}>
              <Text style={styles.fallbackTitle}>{t('location.deniedTitle')}</Text>
              <Text style={styles.fallbackText}>
                {t('location.deniedText')}
              </Text>
            </View>
          </View>
        )}

        {systemState === 'gps-off' && (
          <View style={styles.fallbackBox}>
            <RefreshCw size={18} color={theme.primary} />
            <View style={styles.fallbackContent}>
              <Text style={styles.fallbackTitle}>{t('location.gpsFailTitle')}</Text>
              <Text style={styles.fallbackText}>
                {t('location.gpsFailText')}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.searchSection}>
          <Text style={styles.searchLabel}>{t('location.searchLabel')}</Text>
          <View style={styles.searchBar}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('location.searchPlace')}
              placeholderTextColor={theme.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.matchingSection}>
          <View style={styles.matchingHeader}>
            <Text style={styles.matchingTitle}>{t('location.matchingPlaces')}</Text>
            <Text style={styles.matchingCount}>{t('location.foundCount', { count: filteredLocations.length })}</Text>
          </View>

          <View style={styles.placesList}>
            {filteredLocations.map((loc) => {
              const isSelected = loc.id === selectedLoc.id;
              const name = language === 'bn' ? loc.nameBn : loc.name;
              const district = language === 'bn' ? loc.districtBn : loc.district;

              return (
                <TouchableOpacity
                  key={loc.id}
                  style={[styles.placeCard, isSelected && styles.placeCardSelected]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedLoc(loc)}
                >
                  <View style={styles.placeLeft}>
                    <View
                      style={[
                        styles.placeIconCircle,
                        isSelected && styles.placeIconCircleSelected,
                      ]}
                    >
                      <MapPin
                        size={18}
                        color={isSelected ? theme.surface : theme.textSecondary}
                      />
                    </View>
                    <View style={styles.placeInfo}>
                      <View style={styles.placeNameRow}>
                        <Text
                          style={[
                            styles.placeName,
                            isSelected && styles.placeNameSelected,
                          ]}
                        >
                          {name}
                        </Text>
                        {isSelected && (
                          <View style={styles.currentMatchBadge}>
                            <Text style={styles.currentMatchText}>{t('location.currentMatch')}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.placeDistrict}>
                        {district} · {t('location.doctorCount', { count: loc.doctorCount })}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.checkCircleSelected,
                    ]}
                  >
                    {isSelected ? (
                      <Check size={14} color={theme.surface} strokeWidth={3} />
                    ) : (
                      <ChevronRight size={14} color={theme.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.confirmationCard}>
          <View style={styles.confTop}>
            <Text style={styles.confBadge}>{t('location.yourSearchLocation')}</Text>
            <ShieldCheck size={16} color={theme.primary} />
          </View>
          <View style={styles.confLocationRow}>
            <MapPin size={18} color={theme.primary} />
            <Text style={styles.confLocationText}>
              {displayName}
            </Text>
          </View>
          <Text style={styles.confSubtitle}>
            {t('location.confirmSubtitle')}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.8}
          onPress={handleConfirmLocation}
        >
          <CheckCircle2 size={18} color={theme.textInverse} strokeWidth={2.2} />
          <Text style={styles.confirmBtnText}>{t('location.useThisLocation')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  introText: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primaryLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.primary,
    marginBottom: 14,
  },
  gpsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primaryDark,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.success,
  },
  gpsSubtitle: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 2,
  },
  detectBadge: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.border,
  },
  detectBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  fallbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.warningLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  fallbackContent: {
    flex: 1,
  },
  fallbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.warningText,
  },
  fallbackText: {
    fontSize: 11,
    color: theme.warningText,
    marginTop: 1,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.textPrimary,
  },
  matchingSection: {
    marginBottom: 16,
  },
  matchingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  matchingCount: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  placesList: {
    gap: 8,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  placeCardSelected: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  placeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  placeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeIconCircleSelected: {
    backgroundColor: theme.primary,
  },
  placeInfo: {
    flex: 1,
  },
  placeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  placeNameSelected: {
    fontWeight: '700',
    color: theme.primaryDark,
  },
  currentMatchBadge: {
    backgroundColor: theme.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  currentMatchText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.primary,
  },
  placeDistrict: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: theme.primary,
  },
  confirmationCard: {
    backgroundColor: theme.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 6,
  },
  confTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  confLocationText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  confSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 6,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textInverse,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
});
