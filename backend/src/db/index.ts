import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import {
  SEED_USERS,
  SEED_DOCTORS,
  SEED_ESTABLISHMENTS,
  SEED_PRACTICE_LOCATIONS,
  SEED_SCHEDULES,
  SEED_OVERRIDES,
  SEED_REPORTS,
  SEED_AUDIT_LOGS,
  SEED_HEALTH_TOPICS,
  SEED_HEALTH_ARTICLES
} from './seedData.js';
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

const connectionString = process.env.DATABASE_URL;

export let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (connectionString && !connectionString.includes('localhost:5432/docnear')) {
  try {
    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
  } catch {
    db = null;
  }
}

export const memoryStore: {
  users: UserRecord[];
  doctors: DoctorRecord[];
  establishments: EstablishmentRecord[];
  practiceLocations: PracticeLocationRecord[];
  schedules: ScheduleRecord[];
  overrides: ScheduleOverrideRecord[];
  reports: ReportRecord[];
  auditLogs: AuditLogRecord[];
  healthTopics: HealthTopicRecord[];
  healthArticles: HealthArticleRecord[];
} = {
  users: [...SEED_USERS],
  doctors: [...SEED_DOCTORS],
  establishments: [...SEED_ESTABLISHMENTS],
  practiceLocations: [...SEED_PRACTICE_LOCATIONS],
  schedules: [...SEED_SCHEDULES],
  overrides: [...SEED_OVERRIDES],
  reports: [...SEED_REPORTS],
  auditLogs: [...SEED_AUDIT_LOGS],
  healthTopics: [...SEED_HEALTH_TOPICS],
  healthArticles: [...SEED_HEALTH_ARTICLES]
};
