export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type Day = (typeof DAYS)[number];

export type Role = 'Super Admin' | 'Operations Admin' | 'District Lead' | 'Verifier' | 'Staff' | 'Partner' | 'Patient';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: 'Active' | 'Suspended';
  lastActive: string | null;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  registrationNumber: string;
  council: string;
  qualifications: string;
  experienceYears: number;
  primaryPhone: string;
  email: string | null;
  languages: string[];
  photoUrl: string | null;
  verificationStatus: 'Verified' | 'Needs Review' | 'Pending';
  isActive: boolean;
  affiliatedEstablishmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Establishment {
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
  verificationStatus: 'Verified' | 'Needs Review' | 'Pending';
  accountStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  establishmentId: string;
  name: string;
  roomDesignation: string;
  floor: string;
}

export interface Schedule {
  id: string;
  doctorId: string;
  establishmentId: string;
  practiceLocationId: string;
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  shiftName: string;
  roomNumber: string;
  isActive: boolean;
}

export type OverrideType = 'unavailable' | 'changed' | 'additional';

export interface Override {
  id: string;
  doctorId: string;
  establishmentId: string;
  date: string;
  dayOfWeek: Day;
  overrideType: OverrideType;
  standardShift: string;
  newStartTime: string | null;
  newEndTime: string | null;
  publicReason: string;
  reportedBy: string;
  createdAt: string;
}

export interface Snapshot {
  today: { date: string; dayOfWeek: Day; minutes: number };
  doctors: Doctor[];
  establishments: Establishment[];
  locations: Room[];
  schedules: Schedule[];
  overrides: Override[];
  pendingReports: number;
  pendingClaims: number;
  claimedDoctorIds: string[];
}

export interface Session {
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  practiceLocationId?: string;
}

export interface Report {
  id: string;
  doctorId: string | null;
  establishmentId: string | null;
  doctorName: string | null;
  establishmentName: string | null;
  issueType: string;
  issueTitle: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  source: string;
  reporterPhone: string | null;
  resolutionNotes: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface Invitation {
  id: string;
  kind: 'establishment' | 'doctor';
  establishmentId: string | null;
  doctorId: string | null;
  role: 'Owner' | 'Staff' | 'Doctor';
  name: string;
  phone: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreatedInvite {
  invitation: Invitation;
  code: string;
}

export interface Member {
  id: string;
  role: 'Owner' | 'Staff';
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastActive: string | null;
  createdAt: string;
}

export interface DoctorClaim {
  id: string;
  doctorId: string;
  claimantName: string;
  phone: string;
  email: string | null;
  registrationNumber: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reviewNote: string | null;
  createdAt: string;
  doctor?: { id: string; fullName: string; specialty: string; registrationNumber: string; primaryPhone: string } | null;
  checks?: { registrationMatches: boolean; phoneMatches: boolean };
}

export interface DoctorAccess {
  account: { id: string; userId: string; name: string; email: string; phone: string; createdAt: string } | null;
  invitations: Invitation[];
  claims: DoctorClaim[];
}
