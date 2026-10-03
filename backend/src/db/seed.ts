import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
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

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

const runSeed = async () => {
  try {
    for (const user of SEED_USERS) {
      await db.insert(schema.users).values({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
        lastActive: user.lastActive
      }).onConflictDoNothing();
    }

    for (const est of SEED_ESTABLISHMENTS) {
      await db.insert(schema.establishments).values({
        id: est.id,
        name: est.name,
        type: est.type,
        district: est.district,
        subDistrict: est.subDistrict,
        address: est.address,
        pinCode: est.pinCode,
        phone: est.phone,
        proprietorName: est.proprietorName,
        licenseNumber: est.licenseNumber,
        latitude: est.latitude,
        longitude: est.longitude,
        verificationStatus: est.verificationStatus,
        accountStatus: est.accountStatus,
        isActive: est.isActive
      }).onConflictDoNothing();
    }

    for (const loc of SEED_PRACTICE_LOCATIONS) {
      await db.insert(schema.practiceLocations).values({
        id: loc.id,
        establishmentId: loc.establishmentId,
        name: loc.name,
        roomDesignation: loc.roomDesignation,
        floor: loc.floor,
        isActive: loc.isActive
      }).onConflictDoNothing();
    }

    for (const doc of SEED_DOCTORS) {
      await db.insert(schema.doctors).values({
        id: doc.id,
        fullName: doc.fullName,
        specialty: doc.specialty,
        registrationNumber: doc.registrationNumber,
        council: doc.council,
        qualifications: doc.qualifications,
        experienceYears: doc.experienceYears,
        primaryPhone: doc.primaryPhone,
        email: doc.email,
        languages: doc.languages,
        photoUrl: doc.photoUrl,
        verificationStatus: doc.verificationStatus,
        isActive: doc.isActive,
        affiliatedEstablishmentIds: doc.affiliatedEstablishmentIds
      }).onConflictDoNothing();
    }

    for (const sch of SEED_SCHEDULES) {
      await db.insert(schema.schedules).values({
        id: sch.id,
        doctorId: sch.doctorId,
        establishmentId: sch.establishmentId,
        practiceLocationId: sch.practiceLocationId,
        dayOfWeek: sch.dayOfWeek,
        startTime: sch.startTime,
        endTime: sch.endTime,
        shiftName: sch.shiftName,
        roomNumber: sch.roomNumber,
        tokenPolicy: sch.tokenPolicy,
        maxTokens: sch.maxTokens,
        isActive: sch.isActive
      }).onConflictDoNothing();
    }

    for (const ovr of SEED_OVERRIDES) {
      await db.insert(schema.scheduleOverrides).values({
        id: ovr.id,
        doctorId: ovr.doctorId,
        establishmentId: ovr.establishmentId,
        date: ovr.date,
        dayOfWeek: ovr.dayOfWeek,
        overrideType: ovr.overrideType,
        standardShift: ovr.standardShift,
        publicReason: ovr.publicReason,
        internalNote: ovr.internalNote,
        reportedBy: ovr.reportedBy
      }).onConflictDoNothing();
    }

    for (const rpt of SEED_REPORTS) {
      await db.insert(schema.reports).values({
        id: rpt.id,
        doctorId: rpt.doctorId,
        establishmentId: rpt.establishmentId,
        issueType: rpt.issueType,
        issueTitle: rpt.issueTitle,
        description: rpt.description,
        severity: rpt.severity,
        status: rpt.status,
        source: rpt.source,
        reporterPhone: rpt.reporterPhone
      }).onConflictDoNothing();
    }

    for (const log of SEED_AUDIT_LOGS) {
      await db.insert(schema.auditLogs).values({
        id: log.id,
        timestamp: new Date(log.timestamp),
        actorId: log.actorId,
        actorName: log.actorName,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        entityName: log.entityName,
        details: log.details
      }).onConflictDoNothing();
    }

    for (const topic of SEED_HEALTH_TOPICS) {
      await db.insert(schema.healthTopics).values({
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        category: topic.category,
        description: topic.description,
        icon: topic.icon
      }).onConflictDoNothing();
    }

    for (const art of SEED_HEALTH_ARTICLES) {
      await db.insert(schema.healthArticles).values({
        id: art.id,
        topicId: art.topicId,
        title: art.title,
        slug: art.slug,
        summary: art.summary,
        content: art.content,
        language: art.language,
        readTimeMin: art.readTimeMin,
        status: art.status,
        viewsCount: art.viewsCount
      }).onConflictDoNothing();
    }

    await client.end();
    process.exit(0);
  } catch {
    await client.end();
    process.exit(1);
  }
};

runSeed();
