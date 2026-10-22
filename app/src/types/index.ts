export type AvailabilityStatus = 
  | 'available_today' 
  | 'scheduled_today' 
  | 'unknown' 
  | 'not_available';

export type EstablishmentType = 
  | 'hospital' 
  | 'clinic' 
  | 'nursing_home' 
  | 'pharmacy' 
  | 'doctor_chamber' 
  | 'diagnostic_center';

export interface ScheduleItem {
  id: string;
  doctorPracticeId: string;
  dayOfWeek: number;
  dayName: string;
  dayNameBn: string;
  startTime: string;
  endTime: string;
  slotLabel: string;
  slotLabelBn: string;
  isToday?: boolean;
}

export interface PracticeLocation {
  id: string;
  establishmentId: string;
  establishmentName: string;
  establishmentType: EstablishmentType;
  addressLine: string;
  locality: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  secondaryPhone?: string;
  distanceKm?: number;
  consultationFee?: number;
  notes?: string;
  notesBn?: string;
  tokenInfo?: string;
  tokenInfoBn?: string;
  schedules: ScheduleItem[];
  availability: AvailabilityStatus;
  lastVerifiedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  displayName: string;
  nameBn?: string;
  photoUrl?: string;
  bio: string;
  bioBn?: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number;
  phone?: string;
  registrationNumber: string;
  registrationCouncil: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  lastVerifiedAt: string;
  specialties: string[];
  specialtiesBn: string[];
  languages: string[];
  practices: PracticeLocation[];
  todayAvailability: AvailabilityStatus;
  distanceKm?: number;
  inTown?: boolean;
}

export interface Establishment {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  type: EstablishmentType;
  description: string;
  descriptionBn?: string;
  phone: string;
  secondaryPhone?: string;
  addressLine: string;
  locality: string;
  district: string;
  pincode: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  openingHoursBn?: string;
  isVerified: boolean;
  lastVerifiedAt: string;
  doctorsCount: number;
  visitingDoctors: {
    doctorId: string;
    doctorName: string;
    doctorNameBn?: string;
    specialty: string;
    specialtyBn?: string;
    schedules: ScheduleItem[];
    todayAvailability: AvailabilityStatus;
    fee: number;
  }[];
}

export interface HealthTopic {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  category: string;
  categoryBn: string;
  icon: string;
  description: string;
  descriptionBn: string;
  relatedSpecialties: string[];
  relatedSpecialtiesBn: string[];
  commonSymptoms: { en: string; bn: string }[];
  selfCareTips: { en: string; bn: string }[];
  warningSigns: { en: string; bn: string }[];
  readTimeMinutes: number;
}

export interface MyVisit {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  establishmentId: string;
  establishmentName: string;
  establishmentAddress: string;
  establishmentPhone: string;
  visitDate: string;
  visitTime: string;
  reminderEnabled: boolean;
  notes?: string;
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  type: 'visit_reminder' | 'chamber_update' | 'advisory';
  timestamp: string;
  read: boolean;
  targetId?: string;
  targetType?: 'doctor' | 'establishment' | 'visit';
}

export interface LocationItem {
  id: string;
  name: string;
  nameBn: string;
  district: string;
  districtBn: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isPopular?: boolean;
}

export type ReportIssueType = 
  | 'doctor_not_arrived'
  | 'no_longer_visits'
  | 'schedule_changed'
  | 'wrong_phone'
  | 'incorrect_fee'
  | 'other';

export interface ReportItem {
  id: string;
  doctorId?: string;
  doctorName?: string;
  establishmentId?: string;
  establishmentName?: string;
  reportType: ReportIssueType;
  message: string;
  reportedDate: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface UserProfile {
  name: string;
  phone: string;
}

export type LanguageCode = 'en' | 'bn';
export type ThemeMode = 'light' | 'dark' | 'system';
