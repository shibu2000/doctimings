import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MapPinOff } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';

export const LocationNotice: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { locationStatus, detectLocation, currentLocation, language, theme } = useApp();

  if (locationStatus !== 'denied' && locationStatus !== 'off') return null;

  const town = language === 'bn' ? currentLocation.nameBn : currentLocation.name;

  const handleRetry = async () => {
    const result = await detectLocation();
    if (result === 'denied') Linking.openSettings();
  };

  return (
    <View style={[styles.box, { backgroundColor: theme.warningLight }]}>
      <View style={styles.row}>
        <MapPinOff size={16} color={theme.warningText} />
        <Text style={[styles.text, { color: theme.warningText }]}>
          {t(locationStatus === 'denied' ? 'location.failedDenied' : 'location.failedOff', { town })}
        </Text>
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
