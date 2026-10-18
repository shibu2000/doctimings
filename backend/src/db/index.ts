import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

let current: Database | null = null;
let neonUrl = '';

export const setDb = (db: Database) => {
  current = db;
  neonUrl = '';
};

export const useNeon = (url: string) => {
  if (url === neonUrl && current) return;
  current = drizzle(neon(url), { schema }) as unknown as Database;
  neonUrl = url;
};

export const getDb = (): Database => {
  if (!current) {
    throw new Error('Database connection is not configured');
  }
  return current;
};

export { schema };
