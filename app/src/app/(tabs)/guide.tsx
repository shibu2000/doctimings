import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { HEALTH_TOPICS } from '../../data/mockData';
import { Colors } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { HealthTopic } from '../../types';

export default function GuideScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useApp();
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredTopics = HEALTH_TOPICS.filter((topic) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      topic.name.toLowerCase().includes(term) ||
      topic.nameBn.includes(term) ||
      topic.category.toLowerCase().includes(term) ||
      topic.categoryBn.includes(term)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroHeader}>
          <View style={styles.badgeRow}>
            <View style={styles.verifiedPill}>
              <ShieldCheck size={12} color={Colors.primaryDark} strokeWidth={2.5} />
              <Text style={styles.verifiedPillText}>{t('guide.libraryTitle')}</Text>
            </View>
          </View>
          <Text style={styles.title}>{t('nav.guide')}</Text>
          <Text style={styles.subtitle}>{t('guide.librarySubtitle')}</Text>

          <View style={styles.searchBox}>
            <Search size={16} color={Colors.primary} />
            <TextInput
              style={styles.searchInput}
              value={searchFilter}
              onChangeText={setSearchFilter}
              placeholder="Search topics, symptoms, e.g. Stomach, Skin, Fever..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.topicsCountRow}>
          <Text style={styles.countText}>
            {t('guide.topicsCount', { count: filteredTopics.length })}
          </Text>
        </View>

        <View style={styles.topicsList}>
          {filteredTopics.map((topic: HealthTopic) => {
            const topicName = language === 'bn' ? topic.nameBn : topic.name;
            const categoryName = language === 'bn' ? topic.categoryBn : topic.category;
            const description = language === 'bn' ? topic.descriptionBn : topic.description;

            return (
              <TouchableOpacity
                key={topic.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push(`/guide/${topic.id}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <HeartPulse size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.headerInfo}>
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryText}>{categoryName}</Text>
                      <Text style={styles.readTime}>
                        {t('guide.readTime', { min: topic.readTimeMinutes })}
                      </Text>
                    </View>
                    <Text style={styles.topicName}>{topicName}</Text>
                  </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {description}
                </Text>

                <View style={styles.symptomsPreview}>
                  {topic.commonSymptoms.slice(0, 2).map((symptom, idx) => (
                    <View key={idx} style={styles.symptomPill}>
                      <Text style={styles.symptomText} numberOfLines={1}>
                        • {language === 'bn' ? symptom.bn : symptom.en}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.findDoctorLink}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/search',
                        params: { q: topic.relatedSpecialties[0] },
                      })
                    }
                  >
                    <Stethoscope size={13} color={Colors.primary} />
                    <Text style={styles.findDoctorText}>
                      {topic.relatedSpecialties[0]}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.readAction}>
                    <Text style={styles.readActionText}>Read Guide</Text>
                    <ArrowRight size={14} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroHeader: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  topicsCountRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  topicsList: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  readTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 10,
  },
  symptomsPreview: {
    marginTop: 10,
    gap: 4,
  },
  symptomPill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  symptomText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  findDoctorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  findDoctorText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  readAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
