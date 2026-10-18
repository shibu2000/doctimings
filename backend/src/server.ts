import 'dotenv/config';
import { serve } from '@hono/node-server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import app from './index.js';
import { setDb, type Database } from './db/index.js';
import * as schema from './db/schema.js';

const PORT = Number(process.env.PORT) || 4000;

const connect = async () => {
  const url = process.env.LOCAL_DB === 'pglite' ? '' : process.env.DATABASE_URL;
  if (url) {
    setDb(drizzle(postgres(url, { max: 5 }), { schema }) as unknown as Database);
    return `Postgres (${new URL(url).host})`;
  }
  const { createLocalDb } = await import('./db/local.js');
  const ownerPassword = process.env.LOCAL_ADMIN_PASSWORD || 'admin12345';
  const { db } = await createLocalDb({ dataDir: process.env.LOCAL_DB_DIR || './.local-db', ownerPassword });
  setDb(db);
  return `local PGlite database (sign in with shibudhara147@gmail.com / ${ownerPassword} on first run)`;
};

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomUUID() + crypto.randomUUID();
  console.warn('JWT_SECRET is not set; using a random secret for this process only');
}

connect().then(target => {
  serve({ fetch: app.fetch, port: PORT }, info => {
    console.log(`DocTimings backend listening on port ${info.port} using ${target}`);
  });
});
