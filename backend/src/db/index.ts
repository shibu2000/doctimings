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

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _cachedUrl = '';

export const setDatabaseUrl = (url: string) => {
  if (url && url !== _cachedUrl && !url.includes('localhost:5432/docnear')) {
    try {
      const sql = neon(url);
      _db = drizzle(sql, { schema });
      _cachedUrl = url;
    } catch {
      _db = null;
    }
  }
};

export const getDb = () => {
  const url = process.env.DATABASE_URL || _cachedUrl;
  if (!url || url.includes('localhost:5432/docnear')) {
    return null;
  }
  if (!_db || _cachedUrl !== url) {
    try {
      const sql = neon(url);
      _db = drizzle(sql, { schema });
      _cachedUrl = url;
    } catch {
      _db = null;
    }
  }
  return _db;
};

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const activeDb = getDb();
    if (!activeDb) return undefined;
    const value = (activeDb as any)[prop];
    if (typeof value === 'function') {
      return value.bind(activeDb);
    }
    return value;
  }
});

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
