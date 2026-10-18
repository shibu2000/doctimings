import type { Database } from './index.js';
import * as schema from './schema.js';
import {
  SEED_USERS,
  SEED_DOCTORS,
  SEED_ESTABLISHMENTS,
  SEED_PRACTICE_LOCATIONS,
  SEED_SCHEDULES,
  SEED_HEALTH_TOPICS,
  SEED_HEALTH_ARTICLES
} from './seedData.js';

export const seedDatabase = async (db: Database, options: { ownerPasswordHash?: string } = {}) => {
  await db
    .insert(schema.users)
    .values(
      SEED_USERS.map(u => ({
        ...u,
        passwordHash: options.ownerPasswordHash ?? u.passwordHash
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(schema.establishments)
    .values(SEED_ESTABLISHMENTS.map(({ lastUpdated: _, createdAt: __, updatedAt: ___, ...e }) => e))
    .onConflictDoNothing();

  await db
    .insert(schema.practiceLocations)
    .values(SEED_PRACTICE_LOCATIONS)
    .onConflictDoNothing();

  await db
    .insert(schema.doctors)
    .values(
      SEED_DOCTORS.map(({ lastUpdated: _, createdAt: __, updatedAt: ___, ...d }) => ({
        ...d,
        email: d.email ?? null,
        photoUrl: d.photoUrl ?? null
      }))
    )
    .onConflictDoNothing();

  await db.insert(schema.schedules).values(SEED_SCHEDULES).onConflictDoNothing();

  if (SEED_HEALTH_TOPICS.length) {
    await db.insert(schema.healthTopics).values(SEED_HEALTH_TOPICS).onConflictDoNothing();
  }
  if (SEED_HEALTH_ARTICLES.length) {
    await db.insert(schema.healthArticles).values(SEED_HEALTH_ARTICLES).onConflictDoNothing();
  }
};
