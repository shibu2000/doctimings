import React, { useState } from 'react';
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
import { Colors } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { LocationItem } from '../types';

export default function LocationSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLocation, setCurrentLocation, language, towns, locationStatus } = useApp();

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
          <X size={20} color={Colors.textPrimary} />
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
                <ActivityIndicator size="small" color={Colors.surface} />
              ) : (
                <Crosshair size={22} color={Colors.surface} />
              )}
            </View>
            <View style={styles.gpsTextCol}>
              <View style={styles.gpsTitleRow}>
                <Text style={styles.gpsTitle}>{t('location.useCurrentLocation')}</Text>
                <View style={styles.liveDot} />
              </View>
              <Text style={styles.gpsSubtitle}>
                Use your device location to find doctors nearby
              </Text>
            </View>
          </View>
          <View style={styles.detectBadge}>
            <Text style={styles.detectBadgeText}>Detect</Text>
          </View>
        </TouchableOpacity>

        {systemState === 'denied' && (
          <View style={styles.fallbackBox}>
            <AlertTriangle size={20} color={Colors.warning} />
            <View style={styles.fallbackContent}>
              <Text style={styles.fallbackTitle}>Location access is turned off</Text>
              <Text style={styles.fallbackText}>
                You can choose your town manually below without GPS.
              </Text>
            </View>
          </View>
        )}

        {systemState === 'gps-off' && (
          <View style={styles.fallbackBox}>
            <RefreshCw size={18} color={Colors.primary} />
            <View style={styles.fallbackContent}>
              <Text style={styles.fallbackTitle}>Could not obtain GPS</Text>
              <Text style={styles.fallbackText}>
                Please check location toggle or choose your town below.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.searchSection}>
          <Text style={styles.searchLabel}>Search for a place</Text>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search city, town, village or PIN (e.g. 721503)"
              placeholderTextColor={Colors.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.matchingSection}>
          <View style={styles.matchingHeader}>
            <Text style={styles.matchingTitle}>Matching places</Text>
            <Text style={styles.matchingCount}>{filteredLocations.length} found</Text>
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
                        color={isSelected ? Colors.surface : Colors.textSecondary}
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
                            <Text style={styles.currentMatchText}>Current match</Text>
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
                      <Check size={14} color={Colors.surface} strokeWidth={3} />
                    ) : (
                      <ChevronRight size={14} color={Colors.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.confirmationCard}>
          <View style={styles.confTop}>
            <Text style={styles.confBadge}>Your search location</Text>
            <ShieldCheck size={16} color={Colors.primary} />
          </View>
          <View style={styles.confLocationRow}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.confLocationText}>
              {displayName}
            </Text>
          </View>
          <Text style={styles.confSubtitle}>
            Doctors, clinics, and chemist timings will be shown based on this location.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.8}
          onPress={handleConfirmLocation}
        >
          <CheckCircle2 size={18} color={Colors.textInverse} strokeWidth={2.2} />
          <Text style={styles.confirmBtnText}>Use this location</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  introText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
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
    backgroundColor: Colors.primary,
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
    color: Colors.primaryDark,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.success,
  },
  gpsSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detectBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detectBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  fallbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.warningLight,
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
    color: Colors.warningText,
  },
  fallbackText: {
    fontSize: 11,
    color: Colors.warningText,
    marginTop: 1,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
  },
  matchingCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  placesList: {
    gap: 8,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
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
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeIconCircleSelected: {
    backgroundColor: Colors.primary,
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
    color: Colors.textPrimary,
  },
  placeNameSelected: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  currentMatchBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  currentMatchText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  placeDistrict: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: Colors.primary,
  },
  confirmationCard: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.primary,
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
    color: Colors.textPrimary,
  },
  confSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
