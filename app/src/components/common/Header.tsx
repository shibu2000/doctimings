import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MapPin, Bell, Globe, ChevronDown, WifiOff, Sun, Moon } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';
import { BrandLogo } from './BrandLogo';
import { GlowingIcon } from './GlowingIcon';

export const Header: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentLocation,
    language,
    changeLanguage,
    unreadNotificationsCount,
    isOffline,
    theme,
    isDark,
    themeMode,
    setThemeMode,
  } = useApp();

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    changeLanguage(nextLang);
  };

  const toggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const displayName = language === 'bn' ? currentLocation.nameBn : currentLocation.name;

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {isOffline && (
        <TouchableOpacity
          style={[
            styles.offlineBanner,
            { backgroundColor: theme.errorLight },
          ]}
          activeOpacity={0.8}
          onPress={() => router.push('/offline')}
        >
          <WifiOff size={14} color={theme.error} />
          <Text style={[styles.offlineText, { color: theme.errorText }]}>
            {t('offline.badge')} · {t('offline.subtitle')}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.container}>
        <View style={styles.left}>
          <TouchableOpacity
            style={styles.logoRow}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)')}
          >
            <GlowingIcon glowColor={theme.glowPrimary} size={38} pulse>
              <BrandLogo size={32} />
            </GlowingIcon>
            <View style={styles.titleCol}>
              <Text style={[styles.appTitle, { color: theme.textPrimary }]}>
                {t('common.appName')}
              </Text>
              <TouchableOpacity
                style={styles.locationChip}
                activeOpacity={0.7}
                onPress={() => router.push('/location-select')}
              >
                <MapPin size={13} color={theme.primary} strokeWidth={2.2} />
                <Text
                  style={[styles.locationText, { color: theme.primaryDark }]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <Text style={[styles.changeText, { color: theme.primary }]}>
                  {t('common.change')}
                </Text>
                <ChevronDown size={12} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.right}>
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: isDark
                  ? theme.surfaceVariant
                  : theme.primaryMuted,
              },
            ]}
            activeOpacity={0.7}
            onPress={toggleTheme}
          >
            {isDark ? (
              <Sun size={15} color={theme.warning} />
            ) : (
              <Moon size={15} color={theme.primaryDark} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langButton,
              { backgroundColor: theme.primaryLight },
            ]}
            activeOpacity={0.7}
            onPress={toggleLanguage}
          >
            <Globe size={14} color={theme.primaryDark} />
            <Text style={[styles.langText, { color: theme.primaryDark }]}>
              {language === 'en' ? 'বাংলা' : 'English'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={18} color={theme.textPrimary} />
            {unreadNotificationsCount > 0 && (
              <View
                style={[styles.unreadBadge, { backgroundColor: theme.error }]}
              >
                <Text style={styles.unreadText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  offlineBanner: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  left: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 125,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
