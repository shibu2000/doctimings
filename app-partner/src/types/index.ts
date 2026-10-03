export type DoctorSpecialty =
  | 'General Medicine'
  | 'Pediatrics'
  | 'Dermatology'
  | 'Orthopedics'
  | 'Gynecology & Obs'
  | 'Cardiology'
  | 'General Surgery'
  | 'Pulmonology'
  | 'ENT'
  | 'Ophthalmology'
  | 'Dentistry';

export type AvailabilityStatus =
  | 'available_today'
  | 'scheduled_today'
  | 'unknown'
  | 'not_available'
  | 'delayed';

export type EstablishmentType =
  | 'Pharmacy'
  | 'Clinic'
  | 'Doctor Chamber'
  | 'Polyclinic'
  | 'Diagnostic Center'
  | 'Nursing Home'
  | 'Hospital';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type OverrideType = 'unavailable' | 'changed' | 'additional';

export interface PartnerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Establishment Admin' | 'Counter Staff' | 'Staff' | 'Super Admin' | 'Operations Admin';
  establishmentId?: string;
  status?: string;
}

export interface PracticeLocation {
  id: string;
  establishmentId: string;
  name: string;
  roomDesignation: string;
  floor?: string;
  isActive: boolean;
  assignedDoctorsCount?: number;
}

export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType;
  district: string;
  subDistrict: string;
  address: string;
  pinCode: string;
  phone: string;
  proprietorName: string;
  licenseNumber: string;
  latitude: number;
  longitude: number;
  verificationStatus: 'Verified' | 'Needs Review' | 'Pending';
  accountStatus: 'Platform Managed' | 'Invitation Pending' | 'Account Active';
  isActive: boolean;
  practiceLocations?: PracticeLocation[];
  doctorsCount?: number;
  lastUpdated?: string;
}

export interface DoctorScheduleSlot {
  id: string;
  doctorId: string;
  establishmentId: string;
  practiceLocationId?: string;
  roomName?: string;
  roomNumber?: string;
  dayOfWeek: DayOfWeek;
  shiftName: string;
  startTime: string; // e.g. "17:00" or "5:00 PM"
  endTime: string;   // e.g. "19:00" or "7:00 PM"
  maxTokens?: number;
  consultationFee?: number;
  isActive: boolean;
}

export interface TemporaryOverride {
  id: string;
  scheduleId?: string;
  doctorId: string;
  doctorName?: string;
  establishmentId: string;
  establishmentName?: string;
  overrideDate: string; // YYYY-MM-DD
  overrideType: OverrideType;
  note: string;
  delayMinutes?: number;
  startTime?: string;
  endTime?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  createdAt?: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: DoctorSpecialty | string;
  registrationNumber: string;
  council: string;
  qualifications: string;
  experienceYears: number;
  primaryPhone: string;
  email?: string;
  languages: string[];
  photoUrl?: string;
  verificationStatus: 'Verified' | 'Needs Review' | 'Pending';
  isActive: boolean;
  consultationFee?: number;
  affiliatedEstablishmentIds?: string[];
  schedules?: DoctorScheduleSlot[];
  todayAvailability?: {
    isAvailable: boolean;
    day: string;
    shift?: string;
    timing?: string;
    room?: string;
    isDelayed?: boolean;
    delayMinutes?: number;
    delayReason?: string;
    isCancelled?: boolean;
    currentToken?: number;
    totalTokens?: number;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Establishment Admin' | 'Counter Staff';
  status: 'Active' | 'Invited' | 'Suspended';
  isCurrentUser?: boolean;
  lastActive?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  category: 'Schedule update required' | 'Information update' | 'Roster notice';
  severity: 'Urgent' | 'Quarterly' | 'Routine';
  description: string;
  actionText: string;
  doctorName?: string;
  timing?: string;
  scheduleId?: string;
  doctorId?: string;
}
