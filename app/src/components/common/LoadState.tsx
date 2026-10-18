import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../store/AppContext';

interface Props {
  loading: boolean;
  onRetry: () => void;
  notFound?: boolean;
}

export const LoadState: React.FC<Props> = ({ loading, onRetry, notFound }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <View style={styles.box}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {notFound ? t('doctor.notFound') : t('search.loadFailed')}
          </Text>
          {!notFound && (
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={onRetry}>
              <Text style={[styles.buttonText, { color: theme.textInverse }]}>{t('common.retry')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.link, { color: theme.primary }]}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { alignItems: 'center', gap: 14 },
  title: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  buttonText: { fontSize: 14, fontWeight: '700' },
  link: { fontSize: 14, fontWeight: '600' }
});
