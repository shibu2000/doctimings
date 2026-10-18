import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Stethoscope,
  FileCheck,
  Phone,
  Clock,
  Building2,
  CheckCircle2,
  Plus,
} from 'lucide-react-native';
import { Header } from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { usePartner } from '../../store/PartnerContext';
import { api } from '../../services/api';
import { DoctorSpecialty } from '../../types';

const COMMON_SPECIALTIES: DoctorSpecialty[] = [
  'General Medicine',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Gynecology & Obs',
  'Cardiology',
  'ENT',
  'Ophthalmology',
];

export default function AddDoctorScreen() {
  const router = useRouter();
  const { currentEstablishment, refreshDoctors } = usePartner();

  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState<string>('General Medicine');
  const [qualifications, setQualifications] = useState('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState('8');
  const [regNumber, setRegNumber] = useState('WBMC-');
  const [council, setCouncil] = useState('West Bengal Medical Council');
  const [phone, setPhone] = useState('+91 ');
  const [fee, setFee] = useState('300');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !specialty.trim() || !regNumber.trim()) {
      Alert.alert('Required Fields', 'Please provide the doctor full name, specialty, and registration number.');
      return;
    }

    if (!currentEstablishment) {
      Alert.alert('Error', 'No active establishment selected.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createDoctor({
        fullName: fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`,
        specialty,
        qualifications: qualifications.trim() || 'MBBS',
        experienceYears: parseInt(experienceYears, 10) || 5,
        registrationNumber: regNumber.trim(),
        council: council.trim(),
        primaryPhone: phone.trim(),
        consultationFee: parseInt(fee, 10) || 300,
        affiliatedEstablishmentIds: [currentEstablishment.id],
      });

      if (res.success) {
        Alert.alert('Doctor Added', `${fullName} has been added to your clinic roster.`);
        await refreshDoctors();
        router.back();
      } else {
        Alert.alert('Not saved', res.error?.message || 'Please try again.');
      }
    } catch {
      Alert.alert('Not saved', 'No internet connection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Header title="Add Doctor" subtitle="Affiliate doctor to counter desk" showBack backLabel="Doctors" />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Establishment Context */}
        <View style={styles.establishmentBanner}>
          <Building2 size={16} color={Colors.primary} />
          <Text style={styles.estBannerText}>
            Affiliating to: <Text style={{ fontWeight: '700' }}>{currentEstablishment?.name}</Text>
          </Text>
        </View>

        {/* Doctor Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Doctor Identity</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Doctor Full Name <Text style={{ color: Colors.error }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dr. Bikash Roy"
              placeholderTextColor={Colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Specialty */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specialty</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.specialtyChipsRow}
            >
              {COMMON_SPECIALTIES.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={[
                    styles.specialtyChip,
                    specialty === spec && styles.specialtyChipSelected,
                  ]}
                  onPress={() => setSpecialty(spec)}
                >
                  <Text
                    style={[
                      styles.specialtyChipText,
                      specialty === spec && styles.specialtyChipTextSelected,
                    ]}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Qualifications & Experience */}
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Text style={styles.inputLabel}>Qualifications</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. MBBS, MD"
                placeholderTextColor={Colors.textMuted}
                value={qualifications}
                onChangeText={setQualifications}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Exp (Yrs)</Text>
              <TextInput
                style={styles.input}
                placeholder="8"
                keyboardType="numeric"
                value={experienceYears}
                onChangeText={setExperienceYears}
              />
            </View>
          </View>

          {/* Registration Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              WBMC Registration Number <Text style={{ color: Colors.error }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. WBMC-49201"
              placeholderTextColor={Colors.textMuted}
              value={regNumber}
              onChangeText={setRegNumber}
              autoCapitalize="characters"
            />
          </View>

          {/* Registration Council */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Registration Council</Text>
            <TextInput
              style={styles.input}
              placeholder="West Bengal Medical Council"
              placeholderTextColor={Colors.textMuted}
              value={council}
              onChangeText={setCouncil}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doctor Contact Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98320 00000"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Fee */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Consultation Fee (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="300"
              placeholderTextColor={Colors.textMuted}
              value={fee}
              onChangeText={setFee}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Add Doctor to Roster</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  establishmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  estBannerText: {
    ...Typography.bodySm,
    color: Colors.primaryDark,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
  },
  specialtyChipsRow: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  specialtyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specialtyChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  specialtyChipText: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
  },
  specialtyChipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  submitButtonText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
