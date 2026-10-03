import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import {
  Phone,
  MessageSquare,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  ExternalLink,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do I broadcast that a doctor is running late?',
    answer:
      'From the Home dashboard or Doctor Profile, tap "Doctor Delayed". Choose the delay window (+15m, +30m, +45m, +1h) and select the reason. DocTimings immediately shifts the patient estimated arrival window on the patient app.',
  },
  {
    question: "What happens when I cancel today's chamber?",
    answer:
      'A temporary single-date override is automatically created. Patients searching in your subdivision will see "Not available today", preventing unnecessary travel. Regular weekly timings resume on the next scheduled day.',
  },
  {
    question: 'How do I add a new room or consulting cabin?',
    answer:
      'Navigate to Establishment > Practice Locations > Add Room. Enter the cabin designation (e.g. Chamber 2 Ground Floor). You can then assign visiting doctors directly to that room.',
  },
  {
    question: 'Can counter staff view confidential patient health records?',
    answer:
      'No. The DocTimings Partner Portal is strictly scoped to chamber logistics, queue tokens, room occupancy, and doctor rosters. Counter staff cannot access clinical records or patient medical histories.',
  },
];

export default function HelpSupportScreen() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:18003456789').catch(() => {
      Alert.alert('Phone Helpline', 'Dial 1800-345-6789 from your mobile device.');
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:partner-desk@doctimings.com').catch(() => {
      Alert.alert('Support Email', 'Please email partner-desk@doctimings.com');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Help & Support"
        subtitle="Partner desk guidance & helpline"
        showBack
        backLabel="More"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Support Channels Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dedicated Partner Desk</Text>
          <Text style={styles.cardDesc}>
            Need assistance with doctor roster synchronization or token policies? Our regional team is available 8:00 AM – 9:00 PM IST.
          </Text>

          <View style={styles.channelsList}>
            <TouchableOpacity style={styles.channelRow} onPress={handleCallSupport}>
              <View style={styles.channelIconBox}>
                <Phone size={18} color={Colors.primary} />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>Toll-Free Helpline</Text>
                <Text style={styles.channelSub}>1800-345-6789 (Mon – Sat)</Text>
              </View>
              <ExternalLink size={16} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.channelRow} onPress={handleEmailSupport}>
              <View style={styles.channelIconBox}>
                <Mail size={18} color={Colors.primary} />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>Counter Desk Email</Text>
                <Text style={styles.channelSub}>partner-desk@doctimings.com</Text>
              </View>
              <ExternalLink size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Operational FAQs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        </View>

        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {isOpen ? (
                    <ChevronUp size={20} color={Colors.primary} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
              </View>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  channelsList: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  channelIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
  channelSub: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  sectionHeaderRow: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  faqList: {
    gap: Spacing.sm,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  faqQuestion: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
    flex: 1,
  },
  faqAnswer: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
});
