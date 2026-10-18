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

export type OverrideType = 'unavailable' | 'changed' | 'additional';

export const ADMIN_ROLES = ['Super Admin', 'Operations Admin', 'District Lead', 'Verifier'] as const;

export const STAFF_ROLES = [...ADMIN_ROLES, 'Staff'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type UserRole = AdminRole | 'Staff' | 'Partner' | 'Patient';

export const ACCOUNT_ROLES = [...STAFF_ROLES, 'Partner'] as const;

export type ReportIssueType =
  | 'doc_unavailable'
  | 'sched_change'
  | 'no_longer_practices'
  | 'info_incorrect'
  | 'est_closed'
  | 'other';

export type ReportStatus = 'pending' | 'verified' | 'rejected' | 'resolved';

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: string;
  status: string;
  lastActive: string;
}

export interface DoctorRecord {
  id: string;
  fullName: string;
  specialty: string;
  registrationNumber: string;
  council: string;
  qualifications: string;
  experienceYears: number;
  primaryPhone: string;
  email?: string | null;
  languages: string[];
  photoUrl?: string | null;
  verificationStatus: string;
  isActive: boolean;
  affiliatedEstablishmentIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastUpdated?: string;
}

export interface EstablishmentRecord {
  id: string;
  name: string;
  type: string;
  district: string;
  subDistrict: string;
  address: string;
  pinCode: string;
  phone: string;
  proprietorName: string;
  licenseNumber: string;
  latitude: number;
  longitude: number;
  verificationStatus: string;
  accountStatus: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastUpdated?: string;
}

export interface PracticeLocationRecord {
  id: string;
  establishmentId: string;
  name: string;
  roomDesignation: string;
  floor: string;
  isActive: boolean;
}

export interface ScheduleRecord {
  id: string;
  doctorId: string;
  establishmentId: string;
  practiceLocationId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  shiftName: string;
  roomNumber: string;
  tokenPolicy: string;
  maxTokens: number;
  isActive: boolean;
}

export interface ScheduleOverrideRecord {
  id: string;
  doctorId: string;
  establishmentId: string;
  date: string;
  dayOfWeek: string;
  overrideType: string;
  standardShift: string;
  newStartTime?: string;
  newEndTime?: string;
  publicReason: string;
  internalNote?: string;
  reportedBy: string;
}

export interface ReportRecord {
  id: string;
  doctorId?: string | null;
  establishmentId?: string | null;
  issueType: string;
  issueTitle: string;
  description: string;
  severity: string;
  status: string;
  source: string;
  reporterPhone?: string | null;
  resolutionNotes?: string | null;
  createdAt?: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: string;
}

export interface HealthTopicRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  icon: string;
}

export interface HealthArticleRecord {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  language: string;
  readTimeMin: number;
  status: string;
  viewsCount: number;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
    validatedBody: unknown;
    validatedQuery: unknown;
    access: import('../lib/access.js').Access;
  }
}
