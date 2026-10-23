import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MapPinOff, Wifi } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';

export const LocationNotice: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { locationStatus, detectLocation, currentLocation, language, theme } = useApp();
  const [retrying, setRetrying] = useState(false);

  if (locationStatus === 'ready') return null;

  if (locationStatus === 'detecting' || retrying) {
    return (
      <View style={styles.detecting}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={[styles.detectingText, { color: theme.textSecondary }]}>{t('location.findingExact')}</Text>
      </View>
    );
  }

  const town = language === 'bn' ? currentLocation.nameBn : currentLocation.name;
  const approximate = locationStatus === 'approximate';
  const background = approximate ? theme.primaryMuted : theme.warningLight;
  const foreground = approximate ? theme.primaryDark : theme.warningText;
  const message = approximate
    ? t('location.approximate', { town })
    : t(locationStatus === 'denied' ? 'location.failedDenied' : 'location.failedOff', { town });

  const handleRetry = async () => {
    setRetrying(true);
    const result = await detectLocation();
    setRetrying(false);
    if (result === 'denied') Linking.openSettings();
  };

  return (
    <View style={[styles.box, { backgroundColor: background }]}>
      <View style={styles.row}>
        {approximate ? <Wifi size={16} color={foreground} /> : <MapPinOff size={16} color={foreground} />}
        <Text style={[styles.text, { color: foreground }]}>{message}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
          onPress={handleRetry}
        >
          <Text style={[styles.buttonText, { color: theme.textInverse }]}>
            {locationStatus === 'denied' ? t('location.allowAccess') : t('common.retry')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { borderColor: theme.primary, borderWidth: 1 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/location-select')}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>{t('location.chooseTown')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detecting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  detectingText: {
    fontSize: 13,
  },
  box: {
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
