import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { X, Check, Globe } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { LanguageCode } from '../types';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, changeLanguage } = useApp();
  const [selected, setSelected] = useState<LanguageCode>(language);

  const handleSelect = async (lang: LanguageCode) => {
    setSelected(lang);
    await changeLanguage(lang);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Language / ভাষা</Text>
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
        <View style={styles.heroBox}>
          <Globe size={28} color={Colors.primary} />
          <Text style={styles.heroTitle}>Choose Your Language</Text>
          <Text style={styles.heroSubtitle}>
            You can change your preferred language anytime in Settings.
          </Text>
        </View>

        <View style={styles.optionsList}>
          <TouchableOpacity
            style={[styles.card, selected === 'en' && styles.cardSelected]}
            activeOpacity={0.8}
            onPress={() => handleSelect('en')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.langTag}>
                <Text style={styles.langTagText}>En</Text>
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.langName}>English</Text>
                <Text style={styles.langDesc}>Default language</Text>
              </View>
              {selected === 'en' && (
                <View style={styles.checkBadge}>
                  <Check size={14} color={Colors.surface} strokeWidth={3} />
                </View>
              )}
            </View>
            <Text style={styles.bodyExplain}>
              Clear information, doctor timings, and verified chamber locations in English.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, selected === 'bn' && styles.cardSelected]}
            activeOpacity={0.8}
            onPress={() => handleSelect('bn')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.langTag}>
                <Text style={styles.langTagText}>বা</Text>
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.langName}>বাংলা (Bangla)</Text>
                <Text style={styles.langDesc}>সম্পূর্ণ বাংলা ভাষা</Text>
              </View>
              {selected === 'bn' && (
                <View style={styles.checkBadge}>
                  <Check size={14} color={Colors.surface} strokeWidth={3} />
                </View>
              )}
            </View>
            <Text style={styles.bodyExplain}>
              সহজ বাংলায় ডাক্তার ও চেম্বারের সময়সূচি, ফি ও যোগাযোগের যাবতীয় তথ্য।
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  optionsList: {
    gap: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  langTag: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTagText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  titleCol: {
    flex: 1,
  },
  langName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  langDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyExplain: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
