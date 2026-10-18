import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema.js';
import { seedDatabase } from './seeder.js';
import type { Database } from './index.js';

const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

export const createLocalDb = async (options: { dataDir?: string; ownerPassword: string }) => {
  const client = new PGlite(options.dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  const existingUsers = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
  if (existingUsers.length === 0) {
    const ownerPasswordHash = await bcrypt.hash(options.ownerPassword, 10);
    await seedDatabase(db as unknown as Database, { ownerPasswordHash });
  }
  return { db: db as unknown as Database, close: () => client.close() };
};
