import { pgTable, varchar, text, integer, doublePrecision, boolean, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('Patient'),
  status: varchar('status', { length: 30 }).notNull().default('Active'),
  lastActive: varchar('last_active', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const doctors = pgTable('doctors', {
  id: varchar('id', { length: 50 }).primaryKey(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 100 }).notNull(),
  council: varchar('council', { length: 150 }).notNull().default('West Bengal Medical Council'),
  qualifications: varchar('qualifications', { length: 255 }).notNull(),
  experienceYears: integer('experience_years').notNull().default(0),
  primaryPhone: varchar('primary_phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 150 }),
  languages: jsonb('languages').$type<string[]>().notNull().default(['Bengali', 'English']),
  photoUrl: text('photo_url'),
  verificationStatus: varchar('verification_status', { length: 50 }).notNull().default('Verified'),
  isActive: boolean('is_active').notNull().default(true),
  affiliatedEstablishmentIds: jsonb('affiliated_establishment_ids').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const establishments = pgTable('establishments', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('Doctor Chamber'),
  district: varchar('district', { length: 100 }).notNull(),
  subDistrict: varchar('sub_district', { length: 100 }).notNull(),
  address: text('address').notNull(),
  pinCode: varchar('pin_code', { length: 10 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  proprietorName: varchar('proprietor_name', { length: 150 }).notNull(),
  licenseNumber: varchar('license_number', { length: 100 }).notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  verificationStatus: varchar('verification_status', { length: 50 }).notNull().default('Verified'),
  accountStatus: varchar('account_status', { length: 50 }).notNull().default('Platform Managed'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const practiceLocations = pgTable('practice_locations', {
  id: varchar('id', { length: 50 }).primaryKey(),
  establishmentId: varchar('establishment_id', { length: 50 }).notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  roomDesignation: varchar('room_designation', { length: 100 }).notNull(),
  floor: varchar('floor', { length: 50 }).notNull().default('Ground Floor'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const schedules = pgTable('schedules', {
  id: varchar('id', { length: 50 }).primaryKey(),
  doctorId: varchar('doctor_id', { length: 50 }).notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  establishmentId: varchar('establishment_id', { length: 50 }).notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  practiceLocationId: varchar('practice_location_id', { length: 50 }).notNull(),
  dayOfWeek: varchar('day_of_week', { length: 30 }).notNull(),
  startTime: varchar('start_time', { length: 20 }).notNull(),
  endTime: varchar('end_time', { length: 20 }).notNull(),
  shiftName: varchar('shift_name', { length: 100 }).notNull(),
  roomNumber: varchar('room_number', { length: 50 }).notNull(),
  tokenPolicy: varchar('token_policy', { length: 100 }).notNull().default('First Come First Served'),
  maxTokens: integer('max_tokens').notNull().default(30),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const scheduleOverrides = pgTable('schedule_overrides', {
  id: varchar('id', { length: 50 }).primaryKey(),
  doctorId: varchar('doctor_id', { length: 50 }).notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  establishmentId: varchar('establishment_id', { length: 50 }).notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  date: varchar('date', { length: 20 }).notNull(),
  dayOfWeek: varchar('day_of_week', { length: 30 }).notNull(),
  overrideType: varchar('override_type', { length: 30 }).notNull(),
  standardShift: varchar('standard_shift', { length: 100 }).notNull(),
  newStartTime: varchar('new_start_time', { length: 20 }),
  newEndTime: varchar('new_end_time', { length: 20 }),
  publicReason: text('public_reason').notNull(),
  internalNote: text('internal_note').notNull().default(''),
  reportedBy: varchar('reported_by', { length: 150 }).notNull().default('Operations Desk'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const reports = pgTable('reports', {
  id: varchar('id', { length: 50 }).primaryKey(),
  doctorId: varchar('doctor_id', { length: 50 }),
  establishmentId: varchar('establishment_id', { length: 50 }),
  issueType: varchar('issue_type', { length: 50 }).notNull(),
  issueTitle: varchar('issue_title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  severity: varchar('severity', { length: 30 }).notNull().default('medium'),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  source: varchar('source', { length: 50 }).notNull().default('Mobile App Patient'),
  reporterPhone: varchar('reporter_phone', { length: 30 }),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 50 }).primaryKey(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
  actorId: varchar('actor_id', { length: 50 }).notNull(),
  actorName: varchar('actor_name', { length: 150 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 50 }).notNull(),
  entityName: varchar('entity_name', { length: 150 }).notNull(),
  details: text('details').notNull()
});

export const healthTopics = pgTable('health_topics', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }).default('Stethoscope'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const healthArticles = pgTable('health_articles', {
  id: varchar('id', { length: 50 }).primaryKey(),
  topicId: varchar('topic_id', { length: 50 }).notNull().references(() => healthTopics.id),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  language: varchar('language', { length: 20 }).notNull().default('BOTH'),
  readTimeMin: integer('read_time_min').notNull().default(3),
  status: varchar('status', { length: 30 }).notNull().default('Published'),
  viewsCount: integer('views_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const establishmentMembers = pgTable(
  'establishment_members',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    userId: varchar('user_id', { length: 50 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    establishmentId: varchar('establishment_id', { length: 50 }).notNull().references(() => establishments.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull(),
    invitedBy: varchar('invited_by', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  t => [uniqueIndex('establishment_members_user_establishment').on(t.userId, t.establishmentId)]
);

export const doctorLinks = pgTable(
  'doctor_links',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    userId: varchar('user_id', { length: 50 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    doctorId: varchar('doctor_id', { length: 50 }).notNull().references(() => doctors.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  t => [uniqueIndex('doctor_links_doctor').on(t.doctorId), uniqueIndex('doctor_links_user').on(t.userId)]
);

export const invitations = pgTable(
  'invitations',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    kind: varchar('kind', { length: 20 }).notNull(),
    establishmentId: varchar('establishment_id', { length: 50 }).references(() => establishments.id, { onDelete: 'cascade' }),
    doctorId: varchar('doctor_id', { length: 50 }).references(() => doctors.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull(),
    name: varchar('name', { length: 150 }).notNull().default(''),
    phone: varchar('phone', { length: 30 }).notNull().default(''),
    codeHash: varchar('code_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    usedBy: varchar('used_by', { length: 50 }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdBy: varchar('created_by', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  t => [index('invitations_establishment').on(t.establishmentId), index('invitations_doctor').on(t.doctorId)]
);

export const doctorClaims = pgTable(
  'doctor_claims',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    doctorId: varchar('doctor_id', { length: 50 }).notNull().references(() => doctors.id, { onDelete: 'cascade' }),
    claimantName: varchar('claimant_name', { length: 150 }).notNull(),
    phone: varchar('phone', { length: 30 }).notNull(),
    email: varchar('email', { length: 150 }),
    registrationNumber: varchar('registration_number', { length: 100 }).notNull(),
    message: text('message').notNull().default(''),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    reviewNote: text('review_note'),
    reviewedBy: varchar('reviewed_by', { length: 50 }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  t => [index('doctor_claims_status').on(t.status)]
);
