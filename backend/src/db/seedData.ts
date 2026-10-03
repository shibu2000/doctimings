import {
  UserRecord,
  DoctorRecord,
  EstablishmentRecord,
  PracticeLocationRecord,
  ScheduleRecord,
  ScheduleOverrideRecord,
  ReportRecord,
  AuditLogRecord,
  HealthTopicRecord,
  HealthArticleRecord
} from '../types/index.js';

export const SEED_USERS: UserRecord[] = [
  {
    id: 'USR-OWNER-SHIBU',
    name: 'Shibu Dhara',
    email: 'shibudhara147@gmail.com',
    phone: '+91 98000 11223',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Super Admin',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'USR-ADMIN-DOCTIMINGS',
    name: 'Shibu Dhara',
    email: 'admin@doctimings.com',
    phone: '+91 98000 11223',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Super Admin',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'USR-OPS-03',
    name: 'Rajesh Sharma',
    email: 'admin.ops@docnear.org',
    phone: '+91 94340 12345',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Operations Admin',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'USR-ADMIN-01',
    name: 'Shibu Dhara',
    email: 'admin@docnear.internal',
    phone: '+91 98000 11223',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Super Admin',
    status: 'Active',
    lastActive: 'Just now'
  }
];

export const SEED_DOCTORS: DoctorRecord[] = [];
export const SEED_ESTABLISHMENTS: EstablishmentRecord[] = [];
export const SEED_PRACTICE_LOCATIONS: PracticeLocationRecord[] = [];
export const SEED_SCHEDULES: ScheduleRecord[] = [];
export const SEED_OVERRIDES: ScheduleOverrideRecord[] = [];
export const SEED_REPORTS: ReportRecord[] = [];
export const SEED_AUDIT_LOGS: AuditLogRecord[] = [];
export const SEED_HEALTH_TOPICS: HealthTopicRecord[] = [];
export const SEED_HEALTH_ARTICLES: HealthArticleRecord[] = [];
