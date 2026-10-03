import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Share2,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ArrowRight,
} from 'lucide-react-native';
import { HEALTH_TOPICS } from '../../data/mockData';
import { Colors } from '../../constants/theme';
import { useApp } from '../../store/AppContext';

export default function HealthArticleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useApp();

  const topic = HEALTH_TOPICS.find((tItem) => tItem.id === id) || HEALTH_TOPICS[0];

  const title = language === 'bn' ? topic.nameBn : topic.name;
  const category = language === 'bn' ? topic.categoryBn : topic.category;
  const description = language === 'bn' ? topic.descriptionBn : topic.description;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title} - Health Guide on DocTimings app.`,
      });
    } catch {}
  };

  const handleFindDoctor = () => {
    router.push({
      pathname: '/(tabs)/search',
      params: { q: topic.relatedSpecialties[0] },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nav.guide')}</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleShare}>
          <Share2 size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.articleHero}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <View style={styles.reviewedBadge}>
              <ShieldCheck size={11} color={Colors.primaryDark} />
              <Text style={styles.reviewedText}>
                {t('guide.readTime', { min: topic.readTimeMinutes })}
              </Text>
            </View>
          </View>

          <Text style={styles.articleTitle}>{title}</Text>
          <Text style={styles.leadText}>{description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <HelpCircle size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t('guide.whatIsIt')}</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.bodyText}>{description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <CheckCircle2 size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t('guide.commonSymptoms')}</Text>
          </View>
          <View style={styles.contentCard}>
            {topic.commonSymptoms.map((symptom, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  {language === 'bn' ? symptom.bn : symptom.en}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <HeartHandshake size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t('guide.selfCareTips')}</Text>
          </View>
          <View style={styles.contentCard}>
            {topic.selfCareTips.map((tip, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.bulletText}>
                  {language === 'bn' ? tip.bn : tip.en}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.warningBox}>
            <View style={styles.warningHeader}>
              <AlertTriangle size={18} color={Colors.warning} />
              <Text style={styles.warningTitle}>{t('guide.whenToSeeDoctor')}</Text>
            </View>
            <Text style={styles.warningSubtitle}>{t('guide.warningSigns')}</Text>

            <View style={styles.warningList}>
              {topic.warningSigns.map((warning, idx) => (
                <View key={idx} style={styles.warningItem}>
                  <Text style={styles.warningBullet}>▲</Text>
                  <Text style={styles.warningText}>
                    {language === 'bn' ? warning.bn : warning.en}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.findDoctorBtn}
          activeOpacity={0.8}
          onPress={handleFindDoctor}
        >
          <Stethoscope size={18} color={Colors.textInverse} />
          <Text style={styles.findDoctorBtnText}>{t('guide.findDoctorCta')}</Text>
          <ArrowRight size={18} color={Colors.textInverse} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  articleHero: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewedText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  articleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  leadText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: Colors.warningLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: 14,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warningText,
  },
  warningSubtitle: {
    fontSize: 12,
    color: Colors.warningText,
    marginTop: 4,
    fontWeight: '500',
  },
  warningList: {
    marginTop: 8,
    gap: 6,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  warningBullet: {
    fontSize: 10,
    color: Colors.warningText,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: Colors.warningText,
    lineHeight: 16,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  findDoctorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findDoctorBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textInverse,
  },
});
