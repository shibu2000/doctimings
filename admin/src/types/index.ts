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

export type VerificationStatus = 'Verified' | 'Needs Review' | 'Pending';

export type EstablishmentType =
  | 'Pharmacy'
  | 'Clinic'
  | 'Doctor Chamber'
  | 'Polyclinic'
  | 'Diagnostic Center'
  | 'Nursing Home'
  | 'Hospital';

export type AccountStatus = 'Platform Managed' | 'Invitation Pending' | 'Account Active';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface ScheduleSlot {
  id: string;
  doctorId: string;
  establishmentId: string;
  practiceLocationId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  shiftName: string;
  roomNumber: string;
  tokenPolicy: string;
  maxTokens: number;
  isActive: boolean;
}

export type OverrideType = 'unavailable' | 'changed' | 'additional';

export interface ScheduleOverride {
  id: string;
  doctorId: string;
  establishmentId: string;
  date: string;
  dayOfWeek: DayOfWeek;
  overrideType: OverrideType;
  standardShift: string;
  newStartTime?: string;
  newEndTime?: string;
  publicReason: string;
  internalNote: string;
  reportedBy: string;
  createdAt: string;
}

export interface PracticeLocation {
  id: string;
  establishmentId: string;
  name: string;
  roomDesignation: string;
  floor: string;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: DoctorSpecialty;
  registrationNumber: string;
  council: string;
  qualifications: string;
  experienceYears: number;
  primaryPhone: string;
  email?: string;
  languages: string[];
  photoUrl?: string;
  verificationStatus: VerificationStatus;
  isPracticingToday: boolean;
  affiliatedEstablishmentIds: string[];
  lastUpdated: string;
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
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  isActive: boolean;
  doctorCount: number;
  practiceLocations: PracticeLocation[];
  lastUpdated: string;
}

export type ReportIssueType =
  | 'doc_unavailable'
  | 'sched_change'
  | 'no_longer_practices'
  | 'info_incorrect'
  | 'est_closed'
  | 'loc_incorrect'
  | 'retired'
  | 'other';

export type ReportStatus = 'pending' | 'review' | 'resolved' | 'rejected';

export type ResolutionOutcome =
  | 'confirmed_updated'
  | 'checked_no_change'
  | 'unverified'
  | 'incorrect';

export interface CommunityReport {
  id: string;
  signalRef: string;
  incidentUuid: string;
  doctorId: string;
  doctorName: string;
  establishmentId: string;
  establishmentName: string;
  practiceLocationId?: string;
  issueType: ReportIssueType;
  issueTitle: string;
  userQuote: string;
  observedTimestamp: string;
  reporterTerritory: string;
  status: ReportStatus;
  assignedAdmin?: string;
  verificationMethod?: string;
  adminNotes?: string;
  resolutionOutcome?: ResolutionOutcome;
  resolutionSummary?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  scheduleSlotId?: string;
}

export interface HealthTopic {
  id: string;
  nameEn: string;
  nameBn: string;
  specialty: DoctorSpecialty;
  iconName: string;
  colloquialBengaliTerms: string[];
  articleCount: number;
  isActive: boolean;
}

export interface HealthArticle {
  id: string;
  title: string;
  topicId: string;
  topicName: string;
  language: 'EN' | 'BN' | 'BOTH';
  excerpt: string;
  bodyContent: string;
  whenToSeeDoctor: string[];
  targetSpecialty: DoctorSpecialty;
  status: 'Published' | 'Draft' | 'Archived';
  viewsCount: number;
  updatedAt: string;
}

export type AdminRole = 'Super Admin' | 'Platform Admin' | 'Operations Admin' | 'Verification Admin' | 'Establishment Admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  scopedEstablishmentId?: string;
  scopedEstablishmentName?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  lastActive: string;
  avatarUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'Doctor' | 'Establishment' | 'Schedule' | 'Override' | 'Report' | 'Article' | 'User';
  entityId: string;
  entityName: string;
  details: string;
}

export interface Territory {
  id: string;
  district: string;
  subDistrict: string;
  pinCodes: string[];
  establishmentCount: number;
  doctorCount: number;
  verificationCoveragePercent: number;
}
