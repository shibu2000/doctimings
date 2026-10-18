import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { seedDatabase } from './seeder.js';
import type { Database } from './index.js';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(url, { max: 1 });

seedDatabase(drizzle(client, { schema }) as unknown as Database)
  .then(() => console.log('Seed data inserted (existing rows were left untouched)'))
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
